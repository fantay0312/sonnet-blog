/**
 * rehype 插件：为文章图片添加懒加载、异步解码与远程尺寸标注
 *
 * - loading=lazy / decoding=async：首屏外的截图不阻塞页面加载
 * - width/height：构建期探测远程图片尺寸写入属性，浏览器据此预留空间。
 *   缺少尺寸时懒加载图片会在滚动中不断撑开页面，
 *   目录锚点跳转会偏移近千像素，热力图/阅读进度也会抖动。
 *   探测失败（断网/超时）只是退回无尺寸标注，绝不让构建失败。
 */
import { visit } from "unist-util-visit";
import { imageSize } from "image-size";
import { isIP } from "net";
import { lookup } from "dns/promises";

interface ElementNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
}

type Dimensions = { width: number; height: number } | null;

// 进程级缓存：同一次构建/同一个 dev 进程中每个 URL 只探测一次
const sizeCache = new Map<string, Promise<Dimensions>>();

function parseSize(buf: Uint8Array): Dimensions {
  const dim = imageSize(buf);
  return dim.width && dim.height ? { width: dim.width, height: dim.height } : null;
}

/** SSRF 防护：上传的 Markdown 内容可控，且自动重建以 root 跑构建，
    若不拦截，正文里的 ![](http://169.254.169.254/...) 会让构建进程去打内网/云元数据。
    这里只放行公网 http(s)，解析主机后拒绝环回/私网/链路本地地址。 */
function isPrivateIp(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === "::1" || v === "::" || v.startsWith("fe80:") || v.startsWith("fc") || v.startsWith("fd")) return true;
  // IPv4（含 IPv4-mapped IPv6 形式 ::ffff:10.x）
  const m = v.match(/(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // 链路本地 / 云元数据
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

async function isSafeRemoteUrl(url: string): Promise<boolean> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return false;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return false;
  const host = u.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) return !isPrivateIp(host);
  try {
    const records = await lookup(host, { all: true });
    return records.length > 0 && records.every((r) => !isPrivateIp(r.address));
  } catch {
    return false; // 解析不了就不抓
  }
}

/** 渐进式流读取：边下载边尝试解析，解析成功立即断流。
    不能整文件 arrayBuffer()——图床不支持 Range，相册照片近 10MB；
    也不能只取固定文件头——大 JPEG 的 SOF 标记可能在数 MB 之后 */
async function probeSize(url: string): Promise<Dimensions> {
  try {
    if (!(await isSafeRemoteUrl(url))) return null;
    // redirect: manual —— 不跟随跳转，挡住"外站 302 跳内网"的二跳 SSRF；
    // 跳转的图床拿不到尺寸就退回无标注（best-effort）
    const res = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: "manual" });
    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    let nextTry = 65536; // 64KB 起步，每次翻倍重试解析

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          chunks.push(value);
          total += value.length;
        }
        if (total >= nextTry || done) {
          const buf = new Uint8Array(total);
          let offset = 0;
          for (const c of chunks) {
            buf.set(c, offset);
            offset += c.length;
          }
          try {
            return parseSize(buf);
          } catch {
            if (done) return null;
            nextTry = total * 2;
          }
        }
        if (done) return null;
      }
    } finally {
      reader.cancel().catch(() => {});
    }
  } catch {
    return null;
  }
}

/* 并发限流：全站几十张图同时探测会把带宽打满、触发超时 */
let active = 0;
const waiters: Array<() => void> = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= 4) await new Promise<void>((resolve) => waiters.push(resolve));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiters.shift()?.();
  }
}

function cachedProbe(url: string): Promise<Dimensions> {
  let p = sizeCache.get(url);
  if (!p) {
    // 单次探测：原先失败会立即再探一次，对超时/不可达的 URL 等于把
    // 20s 超时翻倍并占着并发槽，拖慢整个构建；失败就退回无尺寸标注
    p = withSlot(() => probeSize(url));
    sizeCache.set(url, p);
  }
  return p;
}

export default function rehypeLazyImages() {
  return async function transformer(tree: ElementNode) {
    const pending: ElementNode[] = [];

    visit(tree as never, "element", (node: ElementNode) => {
      if (node.tagName !== "img") return;
      const props = (node.properties ||= {});
      props.loading ||= "lazy";
      props.decoding ||= "async";

      const src = String(props.src || "");
      if (!props.width && !props.height && /^https?:\/\//.test(src)) {
        pending.push(node);
      }
    });

    await Promise.all(
      pending.map(async (node) => {
        const dim = await cachedProbe(String(node.properties!.src));
        if (dim) {
          node.properties!.width = dim.width;
          node.properties!.height = dim.height;
        }
      })
    );
  };
}
