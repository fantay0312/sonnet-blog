/**
 * Skills 管理接口
 * GET /api/fantay/skills - 获取所有技能
 * POST /api/fantay/skills - 添加技能行或技能
 * PUT /api/fantay/skills - 更新技能
 * DELETE /api/fantay/skills - 删除技能
 */

import type { APIRoute } from "astro";
import { getSkills, saveSkills, addSkillRow, addSkillToRow, updateSkill, deleteSkill } from "$lib/db";
import { authenticateJWT, jsonResponse, errorResponse } from "$lib/api-auth";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const auth = authenticateJWT(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  const skills = await getSkills();
  return jsonResponse({ success: true, skills });
};

export const POST: APIRoute = async (context) => {
  const auth = authenticateJWT(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  let body: {
    action: "addRow" | "addSkill";
    direction?: "left" | "right";
    rowId?: string;
    skill?: { name: string; icon: string; url?: string };
  };

  try {
    body = await context.request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  if (body.action === "addRow") {
    const direction = body.direction || "left";
    const row = await addSkillRow(direction);
    return jsonResponse({ success: true, row });
  }

  if (body.action === "addSkill") {
    if (!body.rowId || !body.skill) {
      return errorResponse("rowId and skill are required", 400);
    }
    if (!body.skill.name || !body.skill.icon) {
      return errorResponse("skill.name and skill.icon are required", 400);
    }

    const skill = await addSkillToRow(body.rowId, body.skill);
    if (!skill) {
      return errorResponse("Row not found", 404);
    }
    return jsonResponse({ success: true, skill });
  }

  return errorResponse("Invalid action", 400);
};

export const PUT: APIRoute = async (context) => {
  const auth = authenticateJWT(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  let body: {
    action?: "updateSkill" | "reorder";
    rowId?: string;
    skillId?: string;
    updates?: { name?: string; icon?: string; url?: string };
    skills?: any[]; // 完整的 skills 数组用于重排序
  };

  try {
    body = await context.request.json();
  } catch {
    return errorResponse("Invalid JSON body", 400);
  }

  // 完整覆盖（用于拖拽排序）
  if (body.action === "reorder" && body.skills) {
    await saveSkills(body.skills);
    return jsonResponse({ success: true });
  }

  // 更新单个技能
  if (body.action === "updateSkill" || (!body.action && body.rowId && body.skillId)) {
    if (!body.rowId || !body.skillId || !body.updates) {
      return errorResponse("rowId, skillId, and updates are required", 400);
    }

    const updated = await updateSkill(body.rowId, body.skillId, body.updates);
    if (!updated) {
      return errorResponse("Skill not found", 404);
    }
    return jsonResponse({ success: true });
  }

  return errorResponse("Invalid request", 400);
};

export const DELETE: APIRoute = async (context) => {
  const auth = authenticateJWT(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  const url = new URL(context.request.url);
  const rowId = url.searchParams.get("rowId");
  const skillId = url.searchParams.get("skillId");

  if (!rowId || !skillId) {
    return errorResponse("rowId and skillId are required", 400);
  }

  const deleted = await deleteSkill(rowId, skillId);
  if (!deleted) {
    return errorResponse("Skill not found", 404);
  }

  return jsonResponse({ success: true });
};
