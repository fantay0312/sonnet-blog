/**
 * API 认证中间件和辅助函数
 */

import type { APIContext } from "astro";
import { verifyApiKey, verifyJWT } from "./db";

export interface AuthResult {
  success: boolean;
  error?: string;
  keyId?: string;
  permissions?: string[];
}

/**
 * 验证 API Key
 * Header: Authorization: Bearer sonnet_sk_xxx
 */
export async function authenticateApiKey(context: APIContext): Promise<AuthResult> {
  const authHeader = context.request.headers.get("Authorization");

  if (!authHeader) {
    return { success: false, error: "Missing Authorization header" };
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return { success: false, error: "Invalid Authorization format. Use: Bearer <api_key>" };
  }

  const apiKey = parts[1];
  if (!apiKey.startsWith("sonnet_sk_")) {
    return { success: false, error: "Invalid API key format" };
  }

  const keyData = await verifyApiKey(apiKey);
  if (!keyData) {
    return { success: false, error: "Invalid or expired API key" };
  }

  return {
    success: true,
    keyId: keyData.id,
    permissions: keyData.permissions,
  };
}

/**
 * 验证 JWT (用于管理后台)
 * Cookie: auth_token=xxx 或 Header: Authorization: Bearer xxx
 */
export function authenticateJWT(context: APIContext): AuthResult {
  // 先检查 Cookie
  const cookieToken = context.cookies.get("auth_token")?.value;
  // 再检查 Header
  const authHeader = context.request.headers.get("Authorization");
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const token = cookieToken || headerToken;

  if (!token) {
    return { success: false, error: "Not authenticated" };
  }

  const payload = verifyJWT(token);
  if (!payload) {
    return { success: false, error: "Invalid or expired token" };
  }

  return { success: true };
}

/**
 * 检查权限
 */
export function hasPermission(permissions: string[], required: string): boolean {
  return permissions.includes(required) || permissions.includes("*");
}

/**
 * 创建 JSON 响应
 */
export function jsonResponse(data: object, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 创建错误响应
 */
export function errorResponse(message: string, status: number = 400): Response {
  return jsonResponse({ success: false, error: message }, status);
}
