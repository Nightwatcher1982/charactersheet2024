'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * /characters/[id] 直接跳转到角色卡详情页，避免与角色卡详情页功能重复。
 */
export default function CharacterIdRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  useEffect(() => {
    if (id) router.replace(`/characters/${id}/character-sheet`);
  }, [id, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4" />
        <p className="text-gray-600">跳转至角色卡…</p>
      </div>
    </div>
  );
}
