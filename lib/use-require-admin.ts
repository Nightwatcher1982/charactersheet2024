'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/asset-path';

export function useRequireAdmin(): { loading: boolean; isAdmin: boolean } {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const isLoginPage = pathname === '/admin/login' || pathname?.startsWith('/admin/login');
    if (isLoginPage) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(getApiUrl('/api/admin/me'));
        const data = await res.json();
        if (cancelled) return;
        if (res.status === 401 || !data?.isAdmin) {
          const from = pathname ? encodeURIComponent(pathname) : '';
          const target = from ? `/admin/login?from=${from}` : '/admin/login';
          queueMicrotask(() => router.replace(target));
          return;
        }
        setIsAdmin(true);
      } catch {
        if (!cancelled) queueMicrotask(() => router.replace('/admin/login'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return { loading, isAdmin };
}
