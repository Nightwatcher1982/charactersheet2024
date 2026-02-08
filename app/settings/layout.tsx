'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, ArrowLeft } from 'lucide-react';
import { getAssetPath } from '@/lib/asset-path';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${getAssetPath('/pic/settings-bg.png')})` }} aria-hidden />
        <div className="fixed inset-0 z-0 bg-black/40 pointer-events-none" aria-hidden />
        <p className="relative z-10 text-white drop-shadow-md">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${getAssetPath('/pic/settings-bg.png')})` }}
        aria-hidden
      />
      <div className="fixed inset-0 z-0 bg-black/40 pointer-events-none" aria-hidden />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white hover:text-amber-200 mb-6 drop-shadow-md"
        >
          <ArrowLeft className="w-4 h-4" /> 返回首页
        </Link>
        <h1 className="text-2xl font-bold text-white font-cinzel mb-6 drop-shadow-md">账号设置</h1>
        <nav className="flex gap-4 mb-8 border-b-2 border-amber-200/60">
          <Link
            href="/settings"
            className={`pb-2 font-cinzel font-bold ${pathname === '/settings' ? 'text-white border-b-2 border-amber-300 -mb-0.5' : 'text-white/80 hover:text-white'}`}
          >
            <User className="w-4 h-4 inline mr-1" /> 个人资料
          </Link>
          <Link
            href="/settings/security"
            className={`pb-2 font-cinzel font-bold ${pathname === '/settings/security' ? 'text-white border-b-2 border-amber-300 -mb-0.5' : 'text-white/80 hover:text-white'}`}
          >
            <Lock className="w-4 h-4 inline mr-1" /> 安全设置
          </Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
