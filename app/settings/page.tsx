'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, User, Phone } from 'lucide-react';

export default function SettingsProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    email?: string;
    displayName?: string;
    contactInfo?: string;
    role?: string;
  } | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.status === 401) {
          if (!cancelled) router.replace('/login');
          return;
        }
        const data = await res.json();
        if (!res.ok || !data.isLoggedIn) {
          if (!cancelled) router.replace('/login');
          return;
        }
        if (!cancelled) {
          setUser(data.user);
          setDisplayName(data.user.displayName ?? '');
          setContactInfo(data.user.contactInfo ?? '');
        }
      } catch {
        if (!cancelled) setError('加载失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName, contactInfo }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '保存失败');
        return;
      }
      setUser(data.user);
      setMessage('已保存');
    } catch {
      setError('网络错误');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="rounded-2xl border-2 border-amber-200/50 bg-white/5 backdrop-blur-sm shadow-xl p-8 text-center text-white">
        加载中...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-amber-200/50 bg-white/5 backdrop-blur-sm shadow-xl p-6 text-white">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            <Mail className="w-4 h-4 inline mr-1" /> 邮箱
          </label>
          <p className="text-white">{user.email ?? '未绑定'}</p>
          <p className="text-xs text-amber-100/90 mt-1">更换邮箱请在「安全设置」中操作</p>
        </div>
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-white mb-2">
            <User className="w-4 h-4 inline mr-1" /> 显示名称
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="选填"
            className="input-dnd w-full bg-white/95 text-gray-900 placeholder:text-gray-500 border-amber-200/80"
          />
        </div>
        <div>
          <label htmlFor="contactInfo" className="block text-sm font-medium text-white mb-2">
            <Phone className="w-4 h-4 inline mr-1" /> 联系方式
          </label>
          <input
            id="contactInfo"
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            placeholder="选填，如微信/QQ"
            className="input-dnd w-full bg-white/95 text-gray-900 placeholder:text-gray-500 border-amber-200/80"
          />
        </div>
        {user.role && (
          <div>
            <label className="block text-sm font-medium text-white mb-2">账号类型</label>
            <p className="text-white">{user.role === 'member' ? '会员' : '普通用户'}</p>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 bg-green-50 border-2 border-green-300 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-dnd w-full py-3">
          {saving ? '保存中...' : '保存'}
        </button>
      </form>
    </div>
  );
}
