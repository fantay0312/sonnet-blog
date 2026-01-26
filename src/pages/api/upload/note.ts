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
import { authenticateApiKey, hasPermission, jsonResponse, errorResponse, optionsResponse } from "$lib/api-auth";

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

  const locale = body.locale || "zh-cn";
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

    return jsonResponse({
      success: true,
      id: slug,
      path: `src/content/note/${locale}/${slug}.md`,
      url: `/${locale === "zh-cn" ? "" : locale + "/"}note/${slug}`,
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
  return str.replace(/"/g, '\\"').replace(/\n/g, "\\n");
}
