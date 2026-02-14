'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Link from 'next/link';
import { ArrowLeft, User, Key, Crown, FileText, Trash2, ExternalLink } from 'lucide-react';
import { getApiUrl } from '@/lib/asset-path';

type UserDetail = {
  id: string;
  email: string | null;
  displayName: string | null;
  contactInfo: string | null;
  role: string;
  emailVerifiedAt: string | null;
  agreementAcceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  characterCount: number;
};

type CharacterItem = {
  id: string;
  name: string;
  class: string;
  level: number;
  createdAt: string;
  updatedAt: string;
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [characters, setCharacters] = useState<CharacterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [charactersLoading, setCharactersLoading] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetPasswordSubmitting, setResetPasswordSubmitting] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [roleValue, setRoleValue] = useState('');
  const [roleSubmitting, setRoleSubmitting] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(getApiUrl(`/api/admin/users/${id}`));
        if (!res.ok) {
          if (res.status === 404 && !cancelled) setUser(null);
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setUser(data.user ?? null);
          setRoleValue(data.user?.role ?? 'normal');
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const fetchCharacters = async () => {
    if (!id) return;
    setCharactersLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${id}/characters`));
      if (!res.ok) return;
      const data = await res.json();
      setCharacters(data.characters ?? []);
    } catch {
      setCharacters([]);
    } finally {
      setCharactersLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordError('');
    if (!resetPasswordValue || resetPasswordValue.length < 8) {
      setResetPasswordError('密码至少 8 位');
      return;
    }
    setResetPasswordSubmitting(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${id}/password`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: resetPasswordValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResetPasswordError(data.error ?? '重置失败');
        return;
      }
      setResetPasswordValue('');
    } finally {
      setResetPasswordSubmitting(false);
    }
  };

  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setRoleError('');
    setRoleSubmitting(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${id}/role`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRoleError(data.error ?? '更新失败');
        return;
      }
      if (user) setUser({ ...user, role: roleValue });
    } finally {
      setRoleSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm(`确定要删除用户 ${user?.email ?? user?.id} 吗？删除后该用户无法再登录，用户列表中将不再显示。此操作为软删除，数据仍保留在库中。`)) return;
    setDeleteError('');
    setDeleteSubmitting(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/users/${id}`), { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        setDeleteError(data.error ?? '删除失败');
        return;
      }
      router.push('/admin/users');
      router.refresh();
    } catch {
      setDeleteError('请求失败');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleString('zh-CN') : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-400 border-t-gray-800" />
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> 返回用户列表
        </Link>
        <p className="text-gray-500">用户不存在或已注销。</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> 返回用户列表
      </Link>

      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <User className="w-7 h-7" /> 用户详情
      </h1>

      <div className="space-y-6">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">基本信息</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-500">邮箱</dt>
            <dd className="text-gray-800">{user.email ?? '—'}</dd>
            <dt className="text-gray-500">昵称</dt>
            <dd className="text-gray-800">{user.displayName ?? '—'}</dd>
            <dt className="text-gray-500">联系方式</dt>
            <dd className="text-gray-800">{user.contactInfo ?? '—'}</dd>
            <dt className="text-gray-500">等级</dt>
            <dd className="text-gray-800">
              {user.role === 'member' ? '会员' : '普通'}
            </dd>
            <dt className="text-gray-500">邮箱验证时间</dt>
            <dd className="text-gray-800">{formatDate(user.emailVerifiedAt)}</dd>
            <dt className="text-gray-500">协议同意时间</dt>
            <dd className="text-gray-800">{formatDate(user.agreementAcceptedAt)}</dd>
            <dt className="text-gray-500">注册时间</dt>
            <dd className="text-gray-800">{formatDate(user.createdAt)}</dd>
            <dt className="text-gray-500">更新时间</dt>
            <dd className="text-gray-800">{formatDate(user.updatedAt)}</dd>
            <dt className="text-gray-500">角色卡数量</dt>
            <dd className="text-gray-800">{user.characterCount}</dd>
          </dl>
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" /> 重置密码
          </h2>
          <form onSubmit={handleResetPassword} className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                新密码（至少 8 位）
              </label>
              <input
                type="password"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                placeholder="新密码"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                minLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={resetPasswordSubmitting}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {resetPasswordSubmitting ? '提交中…' : '重置密码'}
            </button>
          </form>
          {resetPasswordError && (
            <p className="mt-2 text-sm text-red-600">{resetPasswordError}</p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5" /> 更改等级
          </h2>
          <form onSubmit={handleChangeRole} className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">等级</label>
              <select
                value={roleValue}
                onChange={(e) => setRoleValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
              >
                <option value="normal">普通</option>
                <option value="member">会员</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={roleSubmitting}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {roleSubmitting ? '提交中…' : '保存'}
            </button>
          </form>
          {roleError && (
            <p className="mt-2 text-sm text-red-600">{roleError}</p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> 删除用户
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            删除后该用户无法再登录，用户列表中不再显示（软删除，数据仍保留）。
          </p>
          <button
            type="button"
            onClick={handleDeleteUser}
            disabled={deleteSubmitting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {deleteSubmitting ? '删除中…' : '删除该用户'}
          </button>
          {deleteError && (
            <p className="mt-2 text-sm text-red-600">{deleteError}</p>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" /> 角色卡列表
          </h2>
          <button
            type="button"
            onClick={fetchCharacters}
            disabled={charactersLoading}
            className="mb-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {charactersLoading ? '加载中…' : '加载角色卡'}
          </button>
          {characters.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2 pr-4">名称</th>
                    <th className="py-2 pr-4">职业</th>
                    <th className="py-2 pr-4">等级</th>
                    <th className="py-2 pr-4">创建时间</th>
                    <th className="py-2 pr-4">更新时间</th>
                    <th className="py-2 text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {characters.map((c) => (
                    <tr key={c.id} className="border-b border-gray-100">
                      <td className="py-2 pr-4 text-gray-800">{c.name}</td>
                      <td className="py-2 pr-4 text-gray-600">{c.class || '—'}</td>
                      <td className="py-2 pr-4 text-gray-600">{c.level}</td>
                      <td className="py-2 pr-4 text-gray-500">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="py-2 pr-4 text-gray-500">
                        {formatDate(c.updatedAt)}
                      </td>
                      <td className="py-2 text-right">
                        <Link
                          href={`/characters/${c.id}/character-sheet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" /> 查看
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : charactersLoading ? null : (
            <p className="text-gray-500">点击「加载角色卡」查看该用户的角色卡，或暂无角色卡。</p>
          )}
        </section>
      </div>
    </div>
  );
}
