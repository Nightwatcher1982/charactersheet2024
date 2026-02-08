'use client';

import { useParams } from 'next/navigation';
import { useRequireAuth } from '@/lib/use-require-auth';
import { CharacterDataProvider } from '@/lib/character-data-context';

export default function CharacterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const serverId = params?.id as string;
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parchment-light">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-dark mx-auto mb-4" />
          <p className="text-leather-base">加载中...</p>
        </div>
      </div>
    );
  }

  if (!serverId) return null;

  return (
    <CharacterDataProvider serverId={serverId}>
      {children}
    </CharacterDataProvider>
  );
}
