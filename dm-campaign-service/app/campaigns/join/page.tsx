'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authHeaders, setToken } from '@/lib/token';

const CS_URL = process.env.NEXT_PUBLIC_CHARACTER_SHEET_URL || '';

type Character = { serverId: string; name: string };

function JoinForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code') || '';
  const tokenFromUrl = searchParams.get('token') || '';
  const [inviteCode, setInviteCode] = useState(codeParam);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterId, setCharacterId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingChars, setLoadingChars] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState('');
  const [campaignName, setCampaignName] = useState<string | null>(null);
  const [loginUrl, setLoginUrl] = useState('');

  // 仅在客户端计算登录链接，避免 SSR 与客户端 href 不一致导致 hydration 警告
  useEffect(() => {
    if (typeof window === 'undefined' || !CS_URL) return;
    const redirect =
      inviteCode.trim()
        ? `${window.location.origin}/campaigns/join?code=${encodeURIComponent(inviteCode.trim())}`
        : `${window.location.origin}/campaigns/join`;
    setLoginUrl(`${CS_URL}/login?redirect=${encodeURIComponent(redirect)}`);
  }, [inviteCode]);

  // 从 URL 接收登录回调的 token（角色卡登录后 redirect 回来带 ?token=xxx）
  // 用 ref 防止 Strict Mode 二次挂载重复请求；必须同步发起 fetch，否则 cleanup 会清掉 setTimeout 导致请求从未发出
  const tokenFromUrlFetchedRef = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token')?.trim();
    if (!token || tokenFromUrlFetchedRef.current) return;
    tokenFromUrlFetchedRef.current = true;
    setToken(token);
    setLoadingChars(true);
    setError('');
    params.delete('token');
    const qs = params.toString();
    const currentPathname = pathname || window.location.pathname;
    const nextPath = currentPathname + (qs ? `?${qs}` : '');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch('/api/characters', {
      headers: { Authorization: `Bearer ${token}` },
      redirect: 'manual',
      signal: controller.signal,
    })
      .then((r) => {
        if (r.status === 401) {
          setNeedLogin(true);
          return { characters: [] };
        }
        if (r.status === 503) {
          return r.json().then((d) => ({ ...d, characters: [], configError: true }));
        }
        if (r.type === 'opaqueredirect' || (r.status >= 300 && r.status < 400)) {
          return { characters: [] };
        }
        return r.json();
      })
      .then((data) => {
        if (data?.configError && data?.error) {
          setError(data.error);
        }
        if (data?.sheetRejectedToken && data?.error) {
          setError(data.error);
        }
        if (data?.characters && Array.isArray(data.characters)) {
          setCharacters(data.characters);
        }
      })
      .catch((err) => {
        if (err?.name === 'AbortError') {
          setError('获取角色列表超时，请确认角色卡服务（3000）已启动并刷新重试');
        } else {
          setError('获取角色列表失败，请刷新重试');
        }
        setCharacters([]);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoadingChars(false);
        router.replace(nextPath);
      });
  }, [pathname, router]);

  useEffect(() => {
    if (!inviteCode.trim()) {
      setLoadingChars(false);
      return;
    }
    setCampaignName(null);
    fetch(`/api/campaigns/join/validate?code=${encodeURIComponent(inviteCode.trim())}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid && data.campaignName) setCampaignName(data.campaignName);
      })
      .catch(() => {})
      .finally(() => {});
  }, [inviteCode]);

  // 无 token 时用 localStorage 的 token 拉取角色（例如从本页去登录后已保存过 token）
  useEffect(() => {
    if (tokenFromUrl) return; // URL 里已有 token 时由上面那个 effect 处理
    setNeedLogin(false);
    setError('');
    setLoadingChars(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    fetch('/api/characters', {
      headers: authHeaders(),
      redirect: 'manual',
      signal: controller.signal,
    })
      .then((r) => {
        if (r.status === 401) {
          setNeedLogin(true);
          return { characters: [] };
        }
        if (r.status === 503) {
          return r.json().then((d) => ({ ...d, characters: [], configError: true }));
        }
        if (r.type === 'opaqueredirect' || (r.status >= 300 && r.status < 400)) {
          return { characters: [] };
        }
        return r.json();
      })
      .then((data) => {
        if (data?.configError && data?.error) setError(data.error);
        if (data?.sheetRejectedToken && data?.error) setError(data.error);
        if (data?.characters) setCharacters(data.characters);
      })
      .catch((err) => {
        if (err?.name === 'AbortError') {
          setError('获取角色列表超时，请确认角色卡服务已启动并刷新重试');
        }
        setCharacters([]);
      })
      .finally(() => {
        clearTimeout(timeoutId);
        setLoadingChars(false);
      });
  }, [router, tokenFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!inviteCode.trim() || !characterId) {
      setError('请填写邀请码并选择角色');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          inviteCode: inviteCode.trim().toUpperCase(),
          characterId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '加入失败');
        return;
      }
      router.push(`/campaigns/${data.campaignId}`);
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  if (needLogin) {
    return (
      <div className="min-h-screen p-4 max-w-md mx-auto bg-slate-50">
        <h1 className="text-2xl font-bold mb-4 text-gray-900">加入战役</h1>
        {inviteCode.trim() && campaignName && (
          <p className="text-gray-700 mb-4">将加入：{campaignName}</p>
        )}
        <div className="border border-gray-200 rounded-lg p-6 bg-white">
          <p className="text-gray-800 mb-4">
            请先使用<strong>角色卡账号</strong>登录，登录后可在此页选择已创建的角色加入战役。
          </p>
          {loginUrl ? (
            <a
              href={loginUrl}
              className="inline-block px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              去登录
            </a>
          ) : !CS_URL ? (
            <p className="text-sm text-gray-500">请配置 NEXT_PUBLIC_CHARACTER_SHEET_URL</p>
          ) : null}
        </div>
        <p className="mt-4">
          <Link href="/campaigns" className="text-gray-600 hover:underline text-sm">
            ← 返回战役列表
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto bg-slate-50">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">加入战役</h1>
      {campaignName && (
        <p className="text-gray-700 mb-4">将加入：{campaignName}</p>
      )}
      {loginUrl ? (
        <p className="text-gray-600 text-sm mb-4">
          请使用<strong>角色卡账号</strong>登录以选择角色。
          <a href={loginUrl} className="text-emerald-600 hover:underline ml-1">
            去登录
          </a>
        </p>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">邀请码</label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 uppercase placeholder:text-gray-500"
            placeholder="6 位邀请码"
            maxLength={6}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">选择角色</label>
          {loadingChars ? (
            <p className="text-gray-600">加载角色列表…</p>
          ) : characters.length === 0 ? (
            <div className="text-gray-600 space-y-2">
              <p>
                暂无角色，请先在角色卡中创建角色；或
                {loginUrl ? (
                  <a href={loginUrl} className="text-emerald-600 hover:underline ml-1">去登录</a>
                ) : null}
                切换为已有角色的账号。
              </p>
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded px-3 py-2">
                若您已在角色卡中创建过角色仍看不到列表，请确认：① 角色卡服务（如 3000 端口）已启动；② DM 的 .env 中 <code className="bg-amber-100 px-1 rounded">CHARACTER_SHEET_API_URL</code> 指向角色卡；③ <strong>两边 <code className="bg-amber-100 px-1 rounded">JWT_SECRET</code> 完全一致</strong>（需从角色卡项目的 .env 复制到 dm-campaign-service 的 .env）；④ <strong>必须从本页点击「去登录」</strong>到角色卡登录，登录后会自动跳回并带 token——若您是在别的标签页先登录了 3000 再打开本页，本页拿不到您的登录态，会显示暂无角色。
              </p>
            </div>
          ) : (
            <select
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
            >
              <option value="">请选择</option>
              {characters.map((c) => (
                <option key={c.serverId} value={c.serverId}>
                  {c.name || '未命名'}
                </option>
              ))}
            </select>
          )}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || characters.length === 0}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? '加入中…' : '加入'}
          </button>
          <Link href="/campaigns" className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800">
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-gray-700">加载中…</div>}>
      <JoinForm />
    </Suspense>
  );
}
