'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCharacterStore } from '@/lib/character-store';
import { useEffect, useState } from 'react';
import { Character } from '@/lib/dnd-data';
import Link from 'next/link';
import { ArrowLeft, Home, Printer } from 'lucide-react';
import CharacterSheetSummary from '@/components/CharacterSheetSummary';

export default function CharacterSheetPrintPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { characters } = useCharacterStore();
  const [character, setCharacter] = useState<Character | null>(null);

  useEffect(() => {
    const found = characters.find((c) => c.id === id);
    if (found) {
      setCharacter(found as Character);
    } else {
      router.push('/');
    }
  }, [id, characters, router]);

  const handlePrint = () => {
    window.print();
  };

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载角色卡中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 打印时隐藏的导航栏 */}
      <div className="no-print bg-gradient-to-b from-red-50 to-white py-4">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-md hover:shadow-lg transition-all"
              >
                <Home className="w-5 h-5" />
                <span>回到首页</span>
              </Link>
              <Link
                href={`/characters/${id}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回角色档案</span>
              </Link>
            </div>
            
            <button
              onClick={handlePrint}
              className="btn btn-primary flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              打印角色卡
            </button>
          </div>
        </div>
      </div>

      {/* 使用现有的CharacterSheetSummary组件来显示角色卡 */}
      <div className="print-content">
        <CharacterSheetSummary character={character} />
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-content {
            margin: 0;
            padding: 0;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </>
  );
}
