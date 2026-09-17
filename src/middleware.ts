import { defineMiddleware } from "astro:middleware";
import { verifyJWT } from "$lib/db";

/**
 * 服务端鉴权门：后台主页 /fantay 是 SSR 页面，此前任何匿名访客
 * 直接 GET 就能拿到整套管理 SPA（暴露 API 形态/密钥格式）。客户端那点
 * localStorage 判断只是装饰。这里在渲染前先验 JWT，未登录直接 302 去登录页。
 * 数据接口 /api/fantay/* 各自已校验 JWT，无需在此重复拦截。
 */
export const onRequest = defineMiddleware((context, next) => {
  const { pathname } = context.url;

  if (pathname === "/fantay" || pathname === "/fantay/") {
    const token = context.cookies.get("auth_token")?.value;
    const ok = token ? verifyJWT(token) : null;
    if (!ok) {
      return context.redirect("/fantay/login", 302);
    }
  }

  return next();
});
