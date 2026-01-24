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
import { authenticateApiKey, hasPermission, jsonResponse, errorResponse } from "$lib/api-auth";

export const prerender = false;

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

  const locale = body.locale || "zh-cn";
  const draft = body.draft ?? false;
  const timestamp = new Date().toISOString();

  // 生成文件名 (基于时间戳)
  const dateStr = timestamp.split("T")[0];
  const timeStr = timestamp.split("T")[1].split(".")[0].replace(/:/g, "-");
  const slug = body.title ? generateSlug(body.title) : `${dateStr}-${timeStr}`;

  // 生成 frontmatter
  const frontmatter = ["---", `timestamp: ${timestamp}`, `draft: ${draft}`];

  if (body.title) {
    frontmatter.splice(1, 0, `title: "${escapeYaml(body.title)}"`);
  }

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

    return jsonResponse({
      success: true,
      id: finalSlug,
      path: `src/content/jotting/${locale}/${finalSlug}.md`,
      url: `/${locale === "zh-cn" ? "" : locale + "/"}jotting/${finalSlug}`,
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
  return str.replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
