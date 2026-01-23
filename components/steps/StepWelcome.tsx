'use client';

import { useCharacterStore } from '@/lib/character-store';
import { BookOpen, Sparkles, Scroll } from 'lucide-react';

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

      {/* 创建流程说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">创建流程</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-white rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div>
              <div className="font-bold text-gray-900">选择职业</div>
              <div className="text-sm text-gray-600">
                决定你的角色是战士、法师还是其他12种职业之一
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div>
              <div className="font-bold text-gray-900">确定起源</div>
              <div className="text-sm text-gray-600">
                选择背景（如士兵、学者）、物种（如人类、精灵）和语言
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div>
              <div className="font-bold text-gray-900">确定属性值</div>
              <div className="text-sm text-gray-600">
                分配力量、敏捷等六大属性值，并应用背景加值
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div>
              <div className="font-bold text-gray-900">选择阵营</div>
              <div className="text-sm text-gray-600">
                决定你的角色是守序、混乱、善良还是邪恶
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white rounded-lg p-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold flex-shrink-0">
              5
            </div>
            <div>
              <div className="font-bold text-gray-900">填写细节</div>
              <div className="text-sm text-gray-600">
                选择技能、职业特性、装备，并完善角色信息
              </div>
            </div>
          </div>
        </div>
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

      {/* 提示信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scroll className="w-5 h-5 text-blue-600" />
            <div className="font-bold text-blue-900">新手提示</div>
          </div>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>如果是第一次玩D&D，推荐选择<strong>战士</strong>或<strong>游侠</strong>（复杂度较低）</li>
            <li>选择你感兴趣的职业和背景，规则我们会帮你处理</li>
            <li>可以随时返回修改之前的选择</li>
          </ul>
        </div>

        <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <div className="font-bold text-purple-900">2024 版亮点</div>
          </div>
          <ul className="text-xs text-purple-800 space-y-1 list-disc list-inside">
            <li>属性加值现在来自<strong>背景</strong>而非物种</li>
            <li>每个背景提供一个强大的<strong>专长</strong></li>
            <li>物种特质更加平衡和有趣</li>
            <li>更灵活的装备选择</li>
          </ul>
        </div>
      </div>

      {/* Session Zero 提示 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
        <div className="font-bold text-yellow-900 mb-2">💬 与你的 DM 交流</div>
        <p className="text-sm text-yellow-800">
          开始创建前，建议与你的地下城主（DM）讨论：
        </p>
        <ul className="text-sm text-yellow-700 mt-2 space-y-1 list-disc list-inside">
          <li>游戏的背景设定和主题</li>
          <li>起始等级（通常是1级）</li>
          <li>允许使用的内容和规则</li>
          <li>队伍组成和角色定位</li>
        </ul>
      </div>
    </div>
  );
}
