/**
 * 检查是否已设置管理员
 * GET /api/fantay/check-setup
 */

import type { APIRoute } from "astro";
import { getAdmin } from "$lib/db";
import { jsonResponse } from "$lib/api-auth";

export const prerender = false;

export const GET: APIRoute = async () => {
  const admin = await getAdmin();
  return jsonResponse({
    hasAdmin: admin !== null,
  });
};
