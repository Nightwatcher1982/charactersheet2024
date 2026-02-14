'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAdmin } from '@/lib/use-require-admin';
import { LayoutDashboard, Users, FileText, BookOpen, LogOut } from 'lucide-react';
import { getApiUrl } from '@/lib/asset-path';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading } = useRequireAdmin();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-56 bg-gray-800 text-white flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h1 className="font-bold text-lg">后台管理</h1>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          <Link
            href="/admin/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/dashboard' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <LayoutDashboard className="w-5 h-5" /> 概览
          </Link>
          <Link
            href="/admin/users"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${pathname?.startsWith('/admin/users') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <Users className="w-5 h-5" /> 用户管理
          </Link>
          <Link
            href="/admin/characters"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${pathname?.startsWith('/admin/characters') ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <BookOpen className="w-5 h-5" /> 角色卡管理
          </Link>
          <Link
            href="/admin/audit"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/audit' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
          >
            <FileText className="w-5 h-5" /> 审计日志
          </Link>
        </nav>
        <div className="p-2 border-t border-gray-700">
          <button
            type="button"
            onClick={async () => {
              await fetch(getApiUrl('/api/admin/logout'), { method: 'POST' });
              router.push('/admin/login');
              router.refresh();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg w-full hover:bg-gray-700 transition-colors text-left"
          >
            <LogOut className="w-5 h-5" /> 退出后台
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
