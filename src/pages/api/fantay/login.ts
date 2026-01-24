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

export const POST: APIRoute = async (context) => {
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
    // 首次设置：创建管理员账号
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
