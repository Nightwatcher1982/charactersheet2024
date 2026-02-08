'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, FileText, ChevronRight } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{ totalUsers: number; totalCharacters: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setStats({
            totalUsers: data.totalUsers ?? 0,
            totalCharacters: data.totalCharacters ?? 0,
          });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">概览</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <Users className="w-12 h-12 text-gray-600" />
          <div>
            <p className="text-sm text-gray-500">用户总数</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalUsers ?? '—'}</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
          <FileText className="w-12 h-12 text-gray-600" />
          <div>
            <p className="text-sm text-gray-500">角色卡总数</p>
            <p className="text-2xl font-bold text-gray-800">{stats?.totalCharacters ?? '—'}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷入口</h2>
        <Link
          href="/admin/users"
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" /> 用户管理
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
        <Link
          href="/admin/audit"
          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" /> 审计日志
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
