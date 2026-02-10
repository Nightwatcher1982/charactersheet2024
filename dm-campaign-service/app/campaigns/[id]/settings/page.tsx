'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHeaders, clearToken } from '@/lib/token';

type DmNote = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

type Campaign = {
  id: string;
  name: string;
  status: string;
  inviteCode: string;
  nextSessionAt: string | null;
  backgroundIntro: string | null;
  backgroundImageUrl: string | null;
  createdById: string;
  isDm: boolean;
  dmNotes?: DmNote[];
};

export default function CampaignSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');
  const [nextSessionAt, setNextSessionAt] = useState('');
  const [backgroundIntro, setBackgroundIntro] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [dmNotes, setDmNotes] = useState<DmNote[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadBgSuccess, setUploadBgSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/campaigns/${id}`, { headers: authHeaders() })
      .then((r) => {
        if (r.status === 401) {
          router.push('/campaigns');
          return;
        }
        if (r.status === 403) {
          router.push(`/campaigns/${id}`);
          return;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.campaign) {
          const c = data.campaign;
          setCampaign(c);
          setName(c.name);
          setStatus(c.status);
          setNextSessionAt(c.nextSessionAt ? c.nextSessionAt.slice(0, 16) : '');
          setBackgroundIntro(c.backgroundIntro || '');
          setBackgroundImageUrl(c.backgroundImageUrl || '');
          setDmNotes(c.dmNotes || []);
        }
      })
      .catch(() => setError('加载失败'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign?.isDm) return;
    setError('');
    setSaving(true);
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: name.trim(),
          status,
          nextSessionAt: nextSessionAt || null,
          backgroundIntro: backgroundIntro.trim() || null,
          backgroundImageUrl: backgroundImageUrl.trim() || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || '保存失败');
        return;
      }
      const data = await res.json();
      if (data?.campaign) {
        setCampaign((prev) => (prev ? { ...prev, ...data.campaign } : null));
      }
    } catch {
      setError('网络错误');
    } finally {
      setSaving(false);
    }
  };

  const copyInvite = (what: 'code' | 'link') => {
    if (!campaign) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const text =
      what === 'code'
        ? campaign.inviteCode
        : `${origin}/campaigns/join?code=${campaign.inviteCode}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-700">加载中…</p>
      </div>
    );
  }
  if (!campaign || !campaign.isDm) {
    return (
      <div className="min-h-screen p-4 bg-slate-50">
        <p className="text-red-600">无权编辑或战役不存在</p>
        <Link href="/campaigns" className="text-gray-800 underline mt-2 inline-block">返回列表</Link>
      </div>
    );
  }

  const handleDeleteCampaign = async () => {
    if (!campaign?.isDm || !id) return;
    if (!confirm('确定要删除该战役？此操作不可恢复，所有遭遇与日志将一并删除。')) return;
    setDeleting(true);
    setError('');
    try {
      const res = await fetch(`/api/campaigns/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || '删除失败');
        return;
      }
      router.push('/campaigns');
    } catch {
      setError('网络错误');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-lg mx-auto bg-slate-50">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">战役设置</h1>
        <div className="flex gap-2">
          <Link href={`/campaigns/${id}`} className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800 text-sm">
            ← 返回主厅
          </Link>
          <button
            type="button"
            onClick={() => {
              clearToken();
              window.location.href = '/campaigns';
            }}
            className="px-3 py-1.5 border border-amber-300 rounded hover:bg-amber-100 bg-amber-50/80 text-amber-900 text-sm"
          >
            退出登录
          </button>
        </div>
      </div>

      <div className="border border-red-200 rounded p-4 mb-4 bg-red-50">
        <h2 className="font-medium mb-2 text-gray-900">危险操作</h2>
        <p className="text-sm text-gray-600 mb-2">删除战役后无法恢复，请谨慎操作。</p>
        <button
          type="button"
          onClick={handleDeleteCampaign}
          disabled={deleting}
          className="px-3 py-1.5 border border-red-400 text-red-700 rounded hover:bg-red-100 bg-white text-sm disabled:opacity-50"
        >
          {deleting ? '删除中…' : '删除战役'}
        </button>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      <div className="border border-gray-200 rounded p-4 mb-4 bg-white">
        <h2 className="font-medium mb-2 text-gray-900">邀请</h2>
        <p className="text-sm text-gray-700 mb-2">邀请码：<code className="bg-slate-100 px-1.5 py-0.5 rounded text-gray-800">{campaign.inviteCode}</code></p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => copyInvite('code')}
            className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800 text-sm"
          >
            {copied ? '已复制' : '复制邀请码'}
          </button>
          <button
            type="button"
            onClick={() => copyInvite('link')}
            className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800 text-sm"
          >
            {copied ? '已复制' : '复制邀请链接'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">战役名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
          >
            <option value="active">进行中</option>
            <option value="ended">已结束</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">下次开团时间</label>
          <input
            type="datetime-local"
            value={nextSessionAt}
            onChange={(e) => setNextSessionAt(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">战役背景介绍</label>
          <textarea
            value={backgroundIntro}
            onChange={(e) => setBackgroundIntro(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 min-h-[80px] bg-white text-gray-900 placeholder:text-gray-500"
            placeholder="战役背景、世界观…"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">战役背景图片</label>
          <div className="flex gap-2 flex-wrap items-start">
            <label className="px-3 py-2 border border-gray-300 rounded bg-white text-gray-700 text-sm cursor-pointer hover:bg-gray-50">
              上传图片
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                disabled={uploadingBg}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setError('');
                  setUploadBgSuccess(false);
                  setUploadingBg(true);
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await fetch(`/api/upload/campaign-background`, {
                      method: 'POST',
                      headers: authHeaders(),
                      body: formData,
                    });
                    const data = await res.json();
                    if (!res.ok) {
                      setError(data.error || '上传失败');
                      return;
                    }
                    const url = typeof data.url === 'string' ? data.url.trim() : '';
                    if (url) {
                      setBackgroundImageUrl(url);
                      setUploadBgSuccess(true);
                      setTimeout(() => setUploadBgSuccess(false), 2000);
                    } else {
                      setError('上传成功但未返回图片地址');
                    }
                  } catch {
                    setError('上传失败');
                  } finally {
                    setUploadingBg(false);
                    e.target.value = '';
                  }
                }}
              />
            </label>
            <input
              type="url"
              value={backgroundImageUrl}
              onChange={(e) => setBackgroundImageUrl(e.target.value)}
              className="flex-1 min-w-[180px] border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500 text-sm"
              placeholder="或粘贴图片 URL"
            />
          </div>
          {uploadingBg && <p className="text-gray-500 text-sm mt-1">上传中…</p>}
          {uploadBgSuccess && <p className="text-emerald-600 text-sm mt-1">上传成功，请点击下方「保存」</p>}
          {backgroundImageUrl && (
            <img
              src={backgroundImageUrl}
              alt="背景预览"
              className="mt-2 w-full max-h-40 object-cover rounded border border-gray-200"
            />
          )}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
        >
          {saving ? '保存中…' : '保存'}
        </button>
      </form>

      <div className="border border-gray-200 rounded p-4 mt-6 bg-white">
        <h2 className="font-medium mb-2 text-gray-900">DM 笔记</h2>
        <p className="text-sm text-gray-600 mb-3">按日志顺序展示，仅 DM 可见。</p>
        <div className="space-y-3 mb-4">
          {dmNotes.length === 0 ? (
            <p className="text-gray-500 text-sm">暂无笔记，下方添加一条。</p>
          ) : (
            dmNotes.map((note) => (
              <div
                key={note.id}
                className="border border-gray-100 rounded p-3 bg-slate-50 text-sm text-gray-800 whitespace-pre-wrap"
              >
                <time className="text-gray-500 text-xs block mb-1">
                  {new Date(note.createdAt).toLocaleString('zh-CN')}
                </time>
                {note.content || ''}
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <textarea
            value={newNoteContent}
            onChange={(e) => setNewNoteContent(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-3 py-2 min-h-[80px] bg-white text-gray-900 placeholder:text-gray-500 text-sm"
            placeholder="输入新笔记内容…"
          />
          <button
            type="button"
            disabled={addingNote}
            onClick={async () => {
              if (!newNoteContent.trim()) return;
              setAddingNote(true);
              setError('');
              try {
                const res = await fetch(`/api/campaigns/${id}/dm-notes`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...authHeaders() },
                  body: JSON.stringify({ content: newNoteContent.trim() }),
                });
                const data = await res.json();
                if (!res.ok) {
                  setError(data.error || '添加失败');
                  return;
                }
                if (data?.dmNote) {
                  setDmNotes((prev) => [...prev, data.dmNote]);
                  setNewNoteContent('');
                }
              } catch {
                setError('网络错误');
              } finally {
                setAddingNote(false);
              }
            }}
            className="px-3 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 disabled:opacity-50 text-sm self-end"
          >
            {addingNote ? '添加中…' : '添加笔记'}
          </button>
        </div>
      </div>
    </div>
  );
}
