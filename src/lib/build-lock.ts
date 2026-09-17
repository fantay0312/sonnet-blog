/**
 * 全站共享的构建互斥锁
 *
 * /api/rebuild 和两个上传端点（note/jotting）的自动重建都会以 root 跑
 * `npm run build`。此前各端点各自为政，攻击者（或误操作）可并发触发多个
 * 构建把 CPU/内存打满甚至自重启循环。这里集中成一个进程级锁。
 */

let building = false;

export function isBuilding(): boolean {
  return building;
}

/** 拿到锁返回 true（调用方负责在 finally 里 release）；已在构建则返回 false */
export function tryAcquireBuild(): boolean {
  if (building) return false;
  building = true;
  return true;
}

export function releaseBuild(): void {
  building = false;
}
