'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-parchment-light bg-pattern-parchment flex flex-col items-center justify-center px-4" data-testid="app-error-boundary">
      <div className="card-dnd max-w-md w-full text-center">
        <h1 className="font-cinzel text-2xl font-bold text-leather-dark mb-2">出错了</h1>
        <p className="text-leather-base mb-6">页面加载时发生错误，请重试或返回首页。</p>
        {error?.message && (
          <p className="text-left text-sm text-red-700 bg-red-50 p-3 rounded mb-4 font-mono break-all" data-testid="app-error-message">
            {String(error.message).slice(0, 500)}
          </p>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          <button type="button" onClick={reset} className="btn-dnd">
            重试
          </button>
          <Link href="/" className="btn-dnd inline-block">
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
