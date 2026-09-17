/**
 * 上传随笔 API
 * POST /api/upload/jotting
 *
 * Body:
 * {
 *   content: string,       // Markdown 内容
 *   title?: string,        // 可选标题
 *   mood?: string,
 *   draft?: boolean,
 *   locale?: 'zh-cn' | 'en'
 * }
 */

import type { APIRoute } from "astro";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { exec } from "child_process";
import {
  authenticateApiKey,
  hasPermission,
  jsonResponse,
  errorResponse,
  optionsResponse,
} from "$lib/api-auth";
import { tryAcquireBuild, releaseBuild } from "$lib/build-lock";

export const prerender = false;

// 处理 CORS 预检请求
export const OPTIONS: APIRoute = () => optionsResponse();

export const POST: APIRoute = async (context) => {
  // 验证 API Key
  const auth = await authenticateApiKey(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  // 检查权限
  if (!hasPermission(auth.permissions!, "upload:jotting")) {
    return errorResponse("Permission denied: upload:jotting required", 403);
  }

  // 解析请求体
  let body: {
    content: string;
    title?: string;
    mood?: string;
    draft?: boolean;
    locale?: string;
    autoRebuild?: boolean;
  };

  try {
    body = await context.request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  // 验证必填字段
  if (!body.content || typeof body.content !== "string") {
    return errorResponse("Missing or invalid 'content' field", 400);
  }

  // locale 必须在白名单内：会拼进写入路径，不校验则 "../" 可逃出 content 目录
  const locale = body.locale || "zh-cn";
  if (locale !== "zh-cn" && locale !== "en") {
    return errorResponse("Invalid 'locale' (allowed: zh-cn, en)", 400);
  }
  const draft = body.draft ?? false;
  const timestamp = new Date().toISOString();
  const dateStr = timestamp.split("T")[0];
  const timeStr = timestamp.split("T")[1].split(".")[0];
  const rawTitle = body.title?.trim();
  const title =
    rawTitle && rawTitle.length > 0 ? rawTitle : `${dateStr} ${timeStr}`;

  // 生成文件名 (基于标题或时间戳)
  const slug = rawTitle
    ? generateSlug(rawTitle)
    : `${dateStr}-${timeStr.replace(/:/g, "-")}`;

  // 生成 frontmatter
  const frontmatter = [
    "---",
    `title: "${escapeYaml(title)}"`,
    `timestamp: ${timestamp}`,
    `draft: ${draft}`,
  ];

  if (body.mood) {
    frontmatter.push(`mood: "${escapeYaml(body.mood)}"`);
  }

  frontmatter.push("---", "");

  const fileContent = frontmatter.join("\n") + body.content;

  // 写入文件
  const contentDir = join(process.cwd(), "src", "content", "jotting", locale);

  try {
    if (!existsSync(contentDir)) {
      await mkdir(contentDir, { recursive: true });
    }

    const filePath = join(contentDir, `${slug}.md`);

    // 检查是否已存在，如果存在则添加后缀
    let finalSlug = slug;
    let counter = 1;
    while (existsSync(join(contentDir, `${finalSlug}.md`))) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    await writeFile(join(contentDir, `${finalSlug}.md`), fileContent, "utf-8");

    // 自动重建（默认开启，异步执行不阻塞响应）；与 /api/rebuild 共用构建锁
    const shouldRebuild = body.autoRebuild !== false && tryAcquireBuild();
    if (shouldRebuild) {
      exec("npm run build && pm2 restart blog", { cwd: process.cwd() }, (error) => {
        releaseBuild();
        if (error) {
          console.error("[Auto Rebuild] Failed:", error);
        } else {
          console.log("[Auto Rebuild] Completed");
        }
      });
    }

    return jsonResponse({
      success: true,
      id: finalSlug,
      path: `src/content/jotting/${locale}/${finalSlug}.md`,
      url: `/${locale === "zh-cn" ? "" : locale + "/"}jotting/${finalSlug}`,
      rebuilding: shouldRebuild,
    });
  } catch (error) {
    console.error("Failed to write jotting:", error);
    return errorResponse("Failed to save jotting", 500);
  }
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

function escapeYaml(str: string): string {
  // 顺序要紧：先转义反斜杠本身，再处理引号与换行，
  // 否则标题里一个孤立的 \ 会让双引号 YAML 字符串提前闭合 → 整站构建失败
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r\n?/g, "\\n")
    .replace(/\n/g, "\\n")
    .replace(/[\u2028\u2029]/g, " ");
}
