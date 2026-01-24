/**
 * API Keys 管理接口
 * GET /api/fantay/api-keys - 获取所有 API Keys
 * POST /api/fantay/api-keys - 创建新 API Key
 * DELETE /api/fantay/api-keys - 删除 API Key
 */

import type { APIRoute } from "astro";
import { getApiKeys, createApiKey, deleteApiKey } from "$lib/db";
import { authenticateJWT, jsonResponse, errorResponse } from "$lib/api-auth";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const auth = authenticateJWT(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  const keys = await getApiKeys();

  // 不返回完整的 key hash
  const safeKeys = keys.map((k) => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    permissions: k.permissions,
    createdAt: k.createdAt,
    lastUsedAt: k.lastUsedAt,
  }));

  return jsonResponse({ success: true, keys: safeKeys });
};

export const POST: APIRoute = async (context) => {
  const auth = authenticateJWT(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  let body: { name: string; permissions?: string[] };

  try {
    body = await context.request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  if (!body.name) {
    return errorResponse("Name is required", 400);
  }

  const permissions = body.permissions || ["upload:note", "upload:jotting"];
  const { key, keyData } = await createApiKey(body.name, permissions);

  return jsonResponse({
    success: true,
    key, // 只在创建时返回完整 key
    keyData: {
      id: keyData.id,
      name: keyData.name,
      keyPrefix: keyData.keyPrefix,
      permissions: keyData.permissions,
      createdAt: keyData.createdAt,
    },
  });
};

export const DELETE: APIRoute = async (context) => {
  const auth = authenticateJWT(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return errorResponse("ID is required", 400);
  }

  const deleted = await deleteApiKey(id);

  if (!deleted) {
    return errorResponse("API Key not found", 404);
  }

  return jsonResponse({ success: true });
};
