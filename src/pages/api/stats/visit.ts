/**
 * 访问统计接口
 * POST /api/stats/visit - 记录一次访问并返回统计
 * GET  /api/stats/visit - 仅查询统计
 */

import type { APIRoute } from "astro";
import { recordVisit, getVisitStats } from "$lib/db";
import { jsonResponse } from "$lib/api-auth";

export const prerender = false;

export const POST: APIRoute = async () => {
  const stats = await recordVisit();
  return jsonResponse({ success: true, ...stats });
};

export const GET: APIRoute = async () => {
  const stats = await getVisitStats();
  return jsonResponse({ success: true, ...stats });
};
