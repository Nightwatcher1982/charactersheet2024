'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, ExternalLink } from 'lucide-react';
import { getApiUrl } from '@/lib/asset-path';

type CharacterRow = {
  id: string;
  name: string;
  class: string;
  level: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string | null; displayName: string | null } | null;
};

export default function AdminCharactersPage() {
  const [characters, setCharacters] = useState<CharacterRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [emailFilter, setEmailFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCharacters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (emailFilter) params.set('email', emailFilter);
      const res = await fetch(getApiUrl(`/api/admin/characters?${params}`));
      if (!res.ok) return;
      const data = await res.json();
      setCharacters(data.characters ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setCharacters([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, [page, emailFilter]);

  const totalPages = Math.ceil(total / pageSize) || 1;

  const formatDate = (s: string) => (s ? new Date(s).toLocaleString('zh-CN') : '—');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <FileText className="w-7 h-7" /> 角色卡管理
      </h1>
      <p className="text-gray-600 mb-6">
        查看全部用户创建的角色卡，支持按创建者邮箱筛选。点击「查看」可在新窗口打开角色卡。
      </p>
      <div className="bg-white rounded-lg shadow mb-4 p-4 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">创建者邮箱筛选</label>
          <input
            type="text"
            value={emailFilter}
            onChange={(e) => setEmailFilter(e.target.value)}
            placeholder="包含"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          />
        </div>
        <button
          type="button"
          onClick={() => fetchCharacters()}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          查询
        </button>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : characters.length === 0 ? (
          <div className="p-8 text-center text-gray-500">暂无角色卡</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-gray-600">
                    <th className="py-3 px-4">角色名</th>
                    <th className="py-3 px-4">职业</th>
                    <th className="py-3 px-4">等级</th>
                    <th className="py-3 px-4">创建者</th>
                    <th className="py-3 px-4">公开</th>
                    <th className="py-3 px-4">创建时间</th>
                    <th className="py-3 px-4">更新时间</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {characters.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{c.name}</td>
                      <td className="py-3 px-4 text-gray-600">{c.class || '—'}</td>
                      <td className="py-3 px-4 text-gray-600">{c.level}</td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/admin/users/${c.user?.id ?? '#'}`}
                          className="text-gray-700 hover:text-gray-900 hover:underline"
                        >
                          {c.user?.email ?? c.user?.displayName ?? c.user?.id ?? '—'}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{c.isPublic ? '是' : '否'}</td>
                      <td className="py-3 px-4 text-gray-500">{formatDate(c.createdAt)}</td>
                      <td className="py-3 px-4 text-gray-500">{formatDate(c.updatedAt)}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/characters/${c.id}/character-sheet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" /> 查看
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  共 {total} 张角色卡 · 第 {page} / {totalPages} 页
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
