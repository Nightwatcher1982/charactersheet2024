'use client';

import { useParams } from 'next/navigation';
import { CharacterDataProvider } from '@/lib/character-data-context';

// 不在此处强制登录：公开角色允许未登录通过链接只读访问，由 API 与 Context 区分 isOwner
export default function CharacterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const serverId = params?.id as string;

  if (!serverId) return null;

  return (
    <CharacterDataProvider serverId={serverId}>
      {children}
    </CharacterDataProvider>
  );
}
