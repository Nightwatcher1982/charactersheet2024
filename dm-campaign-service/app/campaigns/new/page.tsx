'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHeaders } from '@/lib/token';

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [backgroundIntro, setBackgroundIntro] = useState('');
  const [backgroundImageUrl, setBackgroundImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('请填写战役名称');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          name: name.trim(),
          backgroundIntro: backgroundIntro.trim() || undefined,
          backgroundImageUrl: backgroundImageUrl.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '创建失败');
        return;
      }
      router.push(`/campaigns/${data.campaign.id}`);
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto bg-slate-50">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">创建战役</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">战役名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-gray-900 placeholder:text-gray-500"
            placeholder="例如：冰风谷"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">战役背景介绍</label>
          <textarea
            value={backgroundIntro}
            onChange={(e) => setBackgroundIntro(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 min-h-[100px] bg-white text-gray-900 placeholder:text-gray-500"
            placeholder="可选：简要介绍战役背景、世界观…"
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
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setError('');
                  setUploadSuccess(false);
                  setUploading(true);
                  try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const res = await fetch('/api/upload/campaign-background', {
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
                      setUploadSuccess(true);
                      setTimeout(() => setUploadSuccess(false), 2000);
                    } else {
                      setError('上传成功但未返回图片地址');
                    }
                  } catch {
                    setError('上传失败');
                  } finally {
                    setUploading(false);
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
          {uploading && <p className="text-gray-500 text-sm mt-1">上传中…</p>}
          {uploadSuccess && <p className="text-emerald-600 text-sm mt-1">上传成功</p>}
          {backgroundImageUrl && (
            <img
              src={backgroundImageUrl}
              alt="背景预览"
              className="mt-2 w-full max-h-40 object-cover rounded border border-gray-200"
            />
          )}
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? '创建中…' : '创建'}
          </button>
          <Link href="/campaigns" className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 bg-white text-gray-800">
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
