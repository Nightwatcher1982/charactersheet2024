'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/asset-path';

export interface AuthUser {
  id: string;
  email?: string;
  displayName?: string;
  role?: string;
}

/**
 * 检查登录状态，未登录时跳转到 /login?from=当前路径
 * @returns { loading, isLoggedIn, user } 供页面显示加载或内容
 */
export function useRequireAuth(): {
  loading: boolean;
  isLoggedIn: boolean;
  user: AuthUser | null;
} {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(getApiUrl('/api/auth/me'));
        const data = await res.json();
        if (cancelled) return;
        if (res.status === 401 || !data?.isLoggedIn) {
          const from = pathname ? encodeURIComponent(pathname) : '';
          router.replace(from ? `/login?from=${from}` : '/login');
          return;
        }
        setIsLoggedIn(true);
        setUser(data.user ?? null);
      } catch {
        if (!cancelled) {
          router.replace('/login');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return { loading, isLoggedIn, user };
}
