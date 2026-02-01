'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCharacterStore } from '@/lib/character-store';
import { useEffect, useState } from 'react';
import { Character } from '@/lib/dnd-data';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function LevelUpPage() {
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

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 头部导航 */}
        <div className="mb-6">
          <Link href={`/characters/${id}`} className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>返回角色档案</span>
          </Link>
        </div>

        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-green-600" />
            升级管理器
          </h1>
          <p className="text-gray-600">引导角色升级，自动计算属性和特性</p>
        </div>

        {/* 当前状态 */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">当前角色状态</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">角色名称</div>
              <div className="text-lg font-semibold">{character.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">当前等级</div>
              <div className="text-lg font-semibold">{character.level}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">职业</div>
              <div className="text-lg font-semibold">{character.class}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">熟练加值</div>
              <div className="text-lg font-semibold">+{Math.floor(2 + (character.level - 1) / 4)}</div>
            </div>
          </div>
        </div>

        {/* 功能说明 */}
        <div className="card bg-gradient-to-r from-green-50 to-white border-2 border-green-300">
          <h2 className="text-xl font-bold text-gray-900 mb-4">升级管理器功能</h2>
          <div className="space-y-3 text-gray-700">
            <p>升级管理器将帮助你：</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>选择职业（单职或多职）</li>
              <li>增加生命值和生命骰（掷骰或固定值）</li>
              <li>自动获得新的职业特性</li>
              <li>为有选项的特性提供选择器</li>
              <li>更新熟练加值及相关派生值</li>
              <li>处理施法者的法术位和准备法术数量</li>
              <li>支持多职业的施法位计算规则</li>
              <li>应用专长带来的属性提升</li>
            </ul>
          </div>
        </div>

        {/* 开发状态提示 */}
        <div className="card mt-6 bg-blue-50 border-2 border-blue-300">
          <h3 className="font-semibold text-blue-900 mb-2">开发状态</h3>
          <p className="text-blue-800 mb-4">
            升级管理器功能正在开发中。完整的升级向导将在后续版本中提供。
          </p>
          <p className="text-sm text-blue-700">
            当前你可以通过&ldquo;编辑角色&rdquo;功能手动调整角色等级和属性。
          </p>
        </div>

        {/* 临时操作按钮 */}
        <div className="mt-6 flex justify-center">
          <Link
            href={`/create?edit=${id}`}
            className="btn btn-primary"
          >
            前往编辑角色
          </Link>
        </div>
      </div>
    </div>
  );
}
