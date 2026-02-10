'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getToken, authHeaders, clearToken } from '@/lib/token';

const CS_URL = process.env.NEXT_PUBLIC_CHARACTER_SHEET_URL || '';

type Campaign = {
  id: string;
  name: string;
  status: string;
  inviteCode?: string;
  role: 'dm' | 'player' | null;
  memberCount: number;
  updatedAt: string;
  nextSessionAt: string | null;
  backgroundIntro: string | null;
  backgroundImageUrl: string | null;
  members: { userId: string; characterId: string }[];
  memberAvatars: (string | null)[];
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [canCreate, setCanCreate] = useState(false);
  const [filterMine, setFilterMine] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unauth, setUnauth] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUnauth(true);
      setLoading(false);
      return;
    }
    fetch('/api/campaigns', { headers: authHeaders() })
      .then((r) => {
        if (r.status === 401) {
          clearToken();
          setUnauth(true);
          return;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.campaigns) setCampaigns(data.campaigns);
        setCanCreate(Boolean(data?.canCreate));
      })
      .catch(() => setUnauth(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!unauth || typeof window === 'undefined') return;
    const base = (CS_URL || '').replace(/\/+$/, '');
    if (!base) return;
    const origin = window.location.origin;
    const callbackUrl = `${origin}/campaigns/callback`;
    const loginUrl = `${base}/login/?from=%2F&redirect=${encodeURIComponent(callbackUrl)}`;
    window.location.href = loginUrl;
  }, [unauth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-700">加载中…</p>
      </div>
    );
  }

  if (unauth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-700">正在跳转到登录…</p>
      </div>
    );
  }

  const filtered =
    filterMine ? campaigns.filter((c) => c.role === 'dm' || c.role === 'player') : campaigns;

  return (
    <div className="min-h-screen p-4 max-w-4xl mx-auto bg-slate-50">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">战役大厅</h1>
        <button
          type="button"
          onClick={() => {
            clearToken();
            window.location.href = '/campaigns';
          }}
          className="px-3 py-1.5 border border-amber-300 bg-amber-50/80 rounded hover:bg-amber-100 text-amber-900 text-sm"
        >
          退出登录
        </button>
      </div>
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        {canCreate ? (
          <Link
            href="/campaigns/new"
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            创建战役
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => alert('只有会员才能创建战役，您还不是会员。')}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            创建战役
          </button>
        )}
        <button
          type="button"
          onClick={() => setFilterMine((v) => !v)}
          className={`px-4 py-2 rounded text-sm ${
            filterMine
              ? 'bg-slate-600 text-white hover:bg-slate-700'
              : 'border border-gray-300 bg-white hover:bg-gray-100 text-gray-800'
          }`}
        >
          我的战役
        </button>
      </div>
      {filtered.length === 0 ? (
        <p className="text-gray-600">
          {filterMine
            ? '没有您参与的战役，取消勾选「我的战役」可查看全部'
            : '暂无战役，创建或加入一个开始吧'}
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none p-0 m-0">
          {filtered.map((c) => (
            <li key={c.id} className="flex">
              <Link
                href={`/campaigns/${c.id}`}
                className="flex flex-col w-full border border-gray-200 bg-white rounded-lg overflow-hidden hover:shadow-md hover:border-gray-300 transition-shadow text-left"
              >
                <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                  {c.backgroundImageUrl ? (
                    <img
                      src={c.backgroundImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl font-serif">
                      {c.name.charAt(0) || '?'}
                    </div>
                  )}
                  {c.role !== null && (
                    <span
                      className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${
                        c.role === 'dm'
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-slate-600/90 text-white'
                      }`}
                    >
                      {c.role === 'dm' ? 'DM' : '玩家'}
                    </span>
                  )}
                </div>
                <div className="p-3 flex flex-col flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900 truncate">{c.name}</h2>
                  {c.backgroundIntro && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1 flex-1">
                      {c.backgroundIntro}
                    </p>
                  )}
                  {c.nextSessionAt && (
                    <p className="text-xs text-amber-700 mt-1">
                      下次开团：{new Date(c.nextSessionAt).toLocaleString('zh-CN', { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <div className="flex -space-x-2">
                      {c.memberAvatars.map((avatar, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center"
                          title={`成员 ${i + 1}`}
                        >
                          {avatar ? (
                            <img
                              src={avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-slate-400 text-xs" aria-hidden>👤</span>
                          )}
                        </div>
                      ))}
                      {c.memberCount === 0 && (
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-slate-500 text-xs">
                          0
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {c.memberCount + 1} 人
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
