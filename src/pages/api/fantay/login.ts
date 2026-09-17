/**
 * 管理员登录 API
 * POST /api/fantay/login
 *
 * Body: { username: string, password: string }
 */

import type { APIRoute } from "astro";
import { getAdmin, createAdmin, verifyAdmin, createJWT } from "$lib/db";
import { jsonResponse, errorResponse } from "$lib/api-auth";

export const prerender = false;

// 进程级登录限速：阻止在线暴力破解。按来源 IP 计数，超额临时锁定。
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000; // 10 分钟
const attempts = new Map<string, { count: number; first: number }>();

function clientKey(context: Parameters<APIRoute>[0]): string {
  // 站点跑在 nginx 之后，clientAddress 多为代理 IP，优先取 XFF 首跳
  const xff = context.request.headers.get("x-forwarded-for");
  return (xff?.split(",")[0].trim() || context.clientAddress || "unknown");
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_ATTEMPTS;
}

function clearAttempts(key: string): void {
  attempts.delete(key);
}

export const POST: APIRoute = async (context) => {
  const key = clientKey(context);
  if (rateLimited(key)) {
    return errorResponse("Too many login attempts. Try again later.", 429);
  }

  let body: { username: string; password: string };

  try {
    body = await context.request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  const { username, password } = body;

  if (!username || !password) {
    return errorResponse("Username and password are required", 400);
  }

  if (password.length < 6) {
    return errorResponse("Password must be at least 6 characters", 400);
  }

  // 检查是否已有管理员
  const existingAdmin = await getAdmin();

  if (!existingAdmin) {
    // 生产环境禁止"首次请求即创建管理员"：否则全新部署存在被陌生人抢注的窗口。
    // 生产部署必须通过 ADMIN_USERNAME/ADMIN_PASSWORD 环境变量配置管理员。
    if (import.meta.env.PROD) {
      return errorResponse(
        "Admin not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD in the server environment.",
        503
      );
    }

    // 首次设置（仅本地开发）：创建管理员账号
    await createAdmin(username, password);

    const token = createJWT({ username, role: "admin" });

    // 设置 HTTP-only cookie
    context.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    clearAttempts(key);

    return jsonResponse({
      success: true,
      token,
      message: "Admin account created successfully",
    });
  }

  // 验证登录
  const isValid = await verifyAdmin(username, password);

  if (!isValid) {
    return errorResponse("Invalid username or password", 401);
  }

  clearAttempts(key);

  const token = createJWT({ username, role: "admin" });

  // 设置 HTTP-only cookie
  context.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  return jsonResponse({
    success: true,
    token,
  });
};
