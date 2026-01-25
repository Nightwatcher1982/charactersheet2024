'use client';

import { useCharacterStore } from '@/lib/character-store';
import { Sparkles } from 'lucide-react';

export default function StepWelcome() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();

  if (!currentCharacter) return null;

  return (
    <div className="space-y-6">
      {/* 欢迎标题 */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-purple-600 rounded-full mb-4">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          创建你的 D&D 角色
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          欢迎来到龙与地下城 2024 版角色创建向导。我们将引导你一步步创建一个独特的冒险者。
        </p>
      </div>

      {/* 可选：角色名称 */}
      <div className="bg-white rounded-lg border-2 border-gray-300 p-5">
        <label className="block font-bold text-gray-900 mb-2">
          角色名称（可选，稍后也可填写）
        </label>
        <input
          type="text"
          value={currentCharacter.name || ''}
          onChange={(e) => updateCurrentCharacter({ name: e.target.value })}
          placeholder="例如：艾瑞克·风行者"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
        />
        <p className="text-sm text-gray-500 mt-2">
          为你的角色起一个独特的名字，或暂时留空稍后填写
        </p>
      </div>
    </div>
  );
}
