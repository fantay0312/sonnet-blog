/**
 * 重建博客 API
 * POST /api/rebuild
 *
 * 触发 npm run build 并重启 PM2 服务
 */

import type { APIRoute } from "astro";
import { exec } from "child_process";
import { promisify } from "util";
import { authenticateApiKey, hasPermission, jsonResponse, errorResponse, optionsResponse } from "$lib/api-auth";
import { tryAcquireBuild, releaseBuild } from "$lib/build-lock";

const execAsync = promisify(exec);

export const prerender = false;

// 处理 CORS 预检请求
export const OPTIONS: APIRoute = () => optionsResponse();

export const POST: APIRoute = async (context) => {
  // 验证 API Key
  const auth = await authenticateApiKey(context);
  if (!auth.success) {
    return errorResponse(auth.error!, 401);
  }

  // 检查权限（需要 admin 权限）
  if (!hasPermission(auth.permissions!, "admin")) {
    return errorResponse("Permission denied: admin required", 403);
  }

  // 防止并发构建（与上传端点的自动重建共用同一把锁）
  if (!tryAcquireBuild()) {
    return errorResponse("Build already in progress", 409);
  }

  try {
    const projectDir = process.cwd();

    // 执行构建
    console.log("[Rebuild] Starting build...");
    const { stdout: buildOut, stderr: buildErr } = await execAsync(
      "npm run build",
      { cwd: projectDir, timeout: 300000 } // 5 分钟超时
    );

    if (buildErr && !buildErr.includes("warn")) {
      console.error("[Rebuild] Build stderr:", buildErr);
    }
    console.log("[Rebuild] Build completed");

    // 重启 PM2 服务（异步执行，不等待结果）
    exec("pm2 restart blog", (error) => {
      if (error) {
        console.error("[Rebuild] PM2 restart failed:", error);
      } else {
        console.log("[Rebuild] PM2 restarted");
      }
    });

    return jsonResponse({
      success: true,
      message: "Build completed, service restarting...",
    });
  } catch (error) {
    // 详细错误只记服务端日志，响应体不回传（避免泄漏路径/工具链信息）
    console.error("[Rebuild] Build failed:", error);
    return errorResponse("Build failed", 500);
  } finally {
    releaseBuild();
  }
};
