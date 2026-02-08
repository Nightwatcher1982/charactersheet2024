import { NextResponse } from 'next/server';

/**
 * 根级 middleware：确保 Next.js 在启动时生成 middleware-manifest.json，
 * 避免访问任意路由时出现 "Cannot find module .../middleware-manifest.json"。
 * 当前不做重定向或鉴权，直接放行。
 */
export function middleware() {
  return NextResponse.next();
}

export const config = {
  // 匹配所有路径，确保 manifest 被生成且 middleware 可被调用
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
