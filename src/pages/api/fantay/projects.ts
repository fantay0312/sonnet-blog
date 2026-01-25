/**
 * Projects Management API
 * GET    /api/fantay/projects     - List all projects
 * POST   /api/fantay/projects     - Create a new project
 * PUT    /api/fantay/projects     - Update a project
 * DELETE /api/fantay/projects?id= - Delete a project
 */

import type { APIRoute } from "astro";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  verifyJWT,
} from "@/lib/db";

// 验证 JWT token
function verifyAuth(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  return verifyJWT(token) !== null;
}

export const GET: APIRoute = async ({ request }) => {
  if (!verifyAuth(request)) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const projects = await getProjects();
  return new Response(JSON.stringify({ success: true, projects }), {
    headers: { "Content-Type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (!verifyAuth(request)) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { name, description, githubUrl, website, icon, star, fork, draft } = body;

    if (!name) {
      return new Response(
        JSON.stringify({ success: false, error: "Name is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
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

    return new Response(JSON.stringify({ success: true, project }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const PUT: APIRoute = async ({ request }) => {
  if (!verifyAuth(request)) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "Project ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const project = await updateProject(id, updates);

    if (!project) {
      return new Response(
        JSON.stringify({ success: false, error: "Project not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ success: true, project }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(
      JSON.stringify({ success: false, error: "Invalid request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const DELETE: APIRoute = async ({ request, url }) => {
  if (!verifyAuth(request)) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(
      JSON.stringify({ success: false, error: "Project ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const success = await deleteProject(id);

  if (!success) {
    return new Response(
      JSON.stringify({ success: false, error: "Project not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
