/**
 * Projects Management API
 * GET    /api/fantay/projects     - List all projects
 * POST   /api/fantay/projects     - Create a new project
 * PUT    /api/fantay/projects     - Update a project
 * DELETE /api/fantay/projects?id= - Delete a project
 */

import type { APIRoute } from "astro";
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "$lib/db";
import { authenticateJWT, errorResponse, jsonResponse } from "$lib/api-auth";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const auth = authenticateJWT(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  const projects = await getProjects();
  return jsonResponse({ success: true, projects });
};

export const POST: APIRoute = async (context) => {
  const auth = authenticateJWT(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  try {
    const body = await context.request.json();
    const { name, description, githubUrl, website, icon, star, fork, draft } =
      body;

    if (!name) {
      return errorResponse("Name is required", 400);
    }

    const project = await createProject({
      name,
      description: description || "",
      githubUrl: githubUrl || "",
      website: website || "",
      icon: icon || "icon-[lucide--folder]",
      star: star || 0,
      fork: fork || 0,
      draft: draft || false,
    });

    return jsonResponse({ success: true, project });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
};

export const PUT: APIRoute = async (context) => {
  const auth = authenticateJWT(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  try {
    const body = await context.request.json();
    const { id, ...updates } = body;

    if (!id) {
      return errorResponse("Project ID is required", 400);
    }

    const project = await updateProject(id, updates);

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    return jsonResponse({ success: true, project });
  } catch {
    return errorResponse("Invalid request body", 400);
  }
};

export const DELETE: APIRoute = async (context) => {
  const auth = authenticateJWT(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  const url = new URL(context.request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return errorResponse("Project ID is required", 400);
  }

  const success = await deleteProject(id);

  if (!success) {
    return errorResponse("Project not found", 404);
  }

  return jsonResponse({ success: true });
};
