/**
 * 上传文记 API
 * POST /api/upload/note
 *
 * Body:
 * {
 *   title: string,
 *   content: string,       // Markdown 内容
 *   tags?: string[],
 *   draft?: boolean,
 *   locale?: 'zh-cn' | 'en'
 * }
 */

import type { APIRoute } from "astro";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { exec } from "child_process";
import { authenticateApiKey, hasPermission, jsonResponse, errorResponse, optionsResponse } from "$lib/api-auth";
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
  if (!hasPermission(auth.permissions!, "upload:note")) {
    return errorResponse("Permission denied: upload:note required", 403);
  }

  // 解析请求体
  let body: {
    title: string;
    content: string;
    tags?: string[];
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
  if (!body.title || typeof body.title !== "string") {
    return errorResponse("Missing or invalid 'title' field", 400);
  }
  if (!body.content || typeof body.content !== "string") {
    return errorResponse("Missing or invalid 'content' field", 400);
  }

  // locale 必须在白名单内：它会拼进写入路径，
  // 不校验则 "../../.." 可逃出 content 目录写任意 .md（root 进程，危险）
  const locale = body.locale || "zh-cn";
  if (locale !== "zh-cn" && locale !== "en") {
    return errorResponse("Invalid 'locale' (allowed: zh-cn, en)", 400);
  }
  const draft = body.draft ?? false;
  const tags = body.tags || [];
  const timestamp = new Date().toISOString();

  // 生成文件名 (slug)
  const slug = generateSlug(body.title);

  // 生成 frontmatter
  const frontmatter = [
    "---",
    `title: "${escapeYaml(body.title)}"`,
    `timestamp: ${timestamp}`,
    `draft: ${draft}`,
  ];

  if (tags.length > 0) {
    frontmatter.push(`tags:`);
    tags.forEach((tag) => frontmatter.push(`  - "${escapeYaml(tag)}"`));
  }

  frontmatter.push("---", "");

  const fileContent = frontmatter.join("\n") + body.content;

  // 写入文件
  const contentDir = join(process.cwd(), "src", "content", "note", locale);

  try {
    if (!existsSync(contentDir)) {
      await mkdir(contentDir, { recursive: true });
    }

    const filePath = join(contentDir, `${slug}.md`);

    // 检查是否已存在
    if (existsSync(filePath)) {
      return errorResponse(`Note with slug '${slug}' already exists`, 409);
    }

    await writeFile(filePath, fileContent, "utf-8");

    // 自动重建（默认开启，异步执行不阻塞响应）；与 /api/rebuild 共用构建锁，
    // 正在构建时跳过本次，避免并发 root 构建堆叠
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
      id: slug,
      path: `src/content/note/${locale}/${slug}.md`,
      url: `/${locale === "zh-cn" ? "" : locale + "/"}note/${slug}`,
      rebuilding: shouldRebuild,
    });
  } catch (error) {
    console.error("Failed to write note:", error);
    return errorResponse("Failed to save note", 500);
  }
};

function generateSlug(title: string): string {
  // 移除特殊字符，转小写，用连字符连接
  return title
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "") // 保留中文、字母、数字、空格、连字符
    .replace(/\s+/g, "-") // 空格转连字符
    .replace(/-+/g, "-") // 多个连字符合并
    .replace(/^-|-$/g, "") // 移除首尾连字符
    .slice(0, 100); // 限制长度
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
