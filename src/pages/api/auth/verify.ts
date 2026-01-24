/**
 * API Key 验证接口
 * GET /api/auth/verify
 */

import type { APIRoute } from "astro";
import { authenticateApiKey, jsonResponse, errorResponse } from "$lib/api-auth";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const auth = await authenticateApiKey(context);

  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  return jsonResponse({
    success: true,
    keyId: auth.keyId,
    permissions: auth.permissions,
  });
};
