'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * /admin 入口：客户端重定向到 dashboard，避免服务端 redirect 与 layout 的 useRequireAdmin 冲突，
 * 并保持与登录页一致的客户端 hooks，避免 "Rendered more hooks"。
 */
export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4" />
        <p className="text-gray-600">跳转中...</p>
      </div>
    </div>
  );
}
