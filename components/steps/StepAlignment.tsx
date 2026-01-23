'use client';

import { useCharacterStore } from '@/lib/character-store';
import { ALIGNMENTS } from '@/lib/dnd-data';
import { Check, AlertTriangle, Scale } from 'lucide-react';
import { useState } from 'react';

export default function StepAlignment() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [showDetails, setShowDetails] = useState<string | null>(null);

  if (!currentCharacter) return null;

  // 阵营详细描述
  const alignmentDetails: Record<string, { description: string; traits: string[]; example: string }> = {
    'lg': {
      description: '守序善良的生物努力按照社会期望做正确的事情。毫不犹豫地对抗不公和保护无辜者的人可能是守序善良。',
      traits: ['正直', '守信', '保护弱者', '尊重法律'],
      example: '圣武士、正直的法官、忠诚的骑士'
    },
    'ng': {
      description: '中立善良的生物尽力做好事，在规则内行事但不觉得受其约束。根据他人需求帮助他人的善良之人可能是中立善良。',
      traits: ['善良', '灵活', '乐于助人', '实用主义'],
      example: '治疗师、善良的冒险者、慈善家'
    },
    'cg': {
      description: '混乱善良的生物按照自己的良心行事，很少考虑他人期望。拦截残暴男爵的税吏并将偷来的钱帮助穷人的叛逆者可能是混乱善良。',
      traits: ['自由', '反抗不公', '个人主义', '善良本心'],
      example: '侠盗、反抗军、自由战士'
    },
    'ln': {
      description: '守序中立的个体按照法律、传统或个人准则行事。遵循有纪律的生活规则——不为需要者的请求或邪恶的诱惑所动的人可能是守序中立。',
      traits: ['纪律', '可靠', '遵守规则', '不偏不倚'],
      example: '士兵、法官、修道士'
    },
    'tn': {
      description: '中立是那些喜欢避免道德问题且不站队的阵营，做当时看起来最好的事情。对道德辩论感到无聊的人可能是中立。',
      traits: ['平衡', '务实', '中立态度', '随遇而安'],
      example: '平民、商人、自然德鲁伊'
    },
    'cn': {
      description: '混乱中立的生物随心所欲，将个人自由置于一切之上。漫游各地靠智慧生活的无赖可能是混乱中立。',
      traits: ['自由至上', '随性', '不可预测', '反权威'],
      example: '浪人、赏金猎人、自由冒险者'
    },
    'le': {
      description: '守序邪恶的生物在传统、忠诚或秩序的准则范围内有条理地攫取自己想要的。在阴谋获取权力的同时剥削公民的贵族可能是守序邪恶。',
      traits: ['野心', '阴谋', '利用规则', '独裁'],
      example: '暴君、邪恶领主、恶魔领主'
    },
    'ne': {
      description: '中立邪恶是那些在追求欲望时对自己造成的伤害毫不在意的人的阵营。随心所欲抢劫和谋杀的罪犯可能是中立邪恶。',
      traits: ['自私', '残忍', '无情', '贪婪'],
      example: '雇佣杀手、残暴的盗贼'
    },
    'ce': {
      description: '混乱邪恶的生物行事具有任意暴力性，被仇恨或嗜血驱使。追求复仇和破坏计划的反派可能是混乱邪恶。',
      traits: ['暴力', '疯狂', '毁灭欲', '无法无天'],
      example: '恶魔、疯狂的杀手、暴徒'
    }
  };

  // 阵营网格位置
  const alignmentGrid = [
    ['lg', 'ng', 'cg'],
    ['ln', 'tn', 'cn'],
    ['le', 'ne', 'ce']
  ];

  const alignmentLabels: Record<string, string> = {
    'lg': '守序善良',
    'ng': '中立善良',
    'cg': '混乱善良',
    'ln': '守序中立',
    'tn': '绝对中立',
    'cn': '混乱中立',
    'le': '守序邪恶',
    'ne': '中立邪恶',
    'ce': '混乱邪恶'
  };

  const isEvil = (alignmentId: string) => alignmentId.includes('e') && alignmentId !== 'ne';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">步骤 4：选择阵营</h2>
        <p className="text-gray-600 mb-6">
          阵营是你角色道德观和世界观的简要描述。它影响你的角色如何看待世界和做出决定。
        </p>
      </div>

      {/* 邪恶阵营警告 */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong className="block mb-1">关于邪恶阵营</strong>
            <p>D&D 通常假设玩家角色不是邪恶阵营。在选择邪恶阵营前，请先与你的 DM 确认。</p>
          </div>
        </div>
      </div>

      {/* 阵营轴说明 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
          <div className="font-bold text-blue-900 mb-2">⚖️ 守序 ⟷ 混乱轴</div>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>守序</strong>：重视结构、传统、法律和可预测性</p>
            <p><strong>中立</strong>：在秩序和自由之间取得平衡</p>
            <p><strong>混乱</strong>：重视自由、灵活和自发性</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
          <div className="font-bold text-green-900 mb-2">❤️ 善良 ⟷ 邪恶轴</div>
          <div className="text-sm text-green-800 space-y-1">
            <p><strong>善良</strong>：关心他人福祉，愿意牺牲帮助他人</p>
            <p><strong>中立</strong>：不特别倾向善良或邪恶</p>
            <p><strong>邪恶</strong>：自私，愿意伤害他人以获利</p>
          </div>
        </div>
      </div>

      {/* 阵营网格选择 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Scale className="w-5 h-5 text-gray-700" />
          <h3 className="font-bold text-gray-900">选择你的阵营</h3>
        </div>

        <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
          {/* 轴标签 */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            <div></div>
            <div className="text-center text-xs font-bold text-gray-600">守序</div>
            <div className="text-center text-xs font-bold text-gray-600">中立</div>
            <div className="text-center text-xs font-bold text-gray-600">混乱</div>
          </div>

          {/* 阵营网格 */}
          {alignmentGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-4 gap-2 mb-2">
              <div className="flex items-center justify-end pr-2 text-xs font-bold text-gray-600">
                {rowIndex === 0 ? '善良' : rowIndex === 1 ? '中立' : '邪恶'}
              </div>
              {row.map((alignmentId) => {
                const isSelected = currentCharacter.alignment === alignmentId;
                const alignment = ALIGNMENTS.find(a => a.id === alignmentId);

                return (
                  <button
                    key={alignmentId}
                    onClick={() => updateCurrentCharacter({ alignment: alignmentId })}
                    className={`p-3 rounded-lg border-2 transition-all relative ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : isEvil(alignmentId)
                        ? 'border-red-300 bg-red-50 hover:border-red-400 hover:shadow-md'
                        : 'border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50 hover:shadow-md'
                    }`}
                  >
                    <div className="text-xs font-bold text-gray-900 text-center leading-tight">
                      {alignment?.name}
                    </div>
                    <div className="text-[10px] text-gray-500 text-center mt-1">
                      ({alignment?.nameEn.split(' ').map(w => w[0]).join('')})
                    </div>
                    {isSelected && (
                      <div className="absolute -top-2 -right-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* 选中阵营的详细说明 */}
      {currentCharacter.alignment && (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xs text-purple-600">你选择的阵营</div>
              <div className="text-lg font-bold text-purple-900">
                {alignmentLabels[currentCharacter.alignment]}
              </div>
            </div>
          </div>

          {alignmentDetails[currentCharacter.alignment] && (
            <div className="space-y-3">
              <div className="text-sm text-gray-700 bg-white rounded p-3 border border-purple-200">
                {alignmentDetails[currentCharacter.alignment].description}
              </div>

              <div>
                <div className="text-xs font-bold text-purple-900 mb-2">典型特质：</div>
                <div className="flex flex-wrap gap-2">
                  {alignmentDetails[currentCharacter.alignment].traits.map((trait, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-600 bg-white rounded p-3 border border-purple-200">
                <strong>典型角色：</strong>{alignmentDetails[currentCharacter.alignment].example}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 帮助信息 */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-sm text-gray-700">
        <div className="font-bold mb-2">💡 关于阵营</div>
        <ul className="list-disc list-inside space-y-1">
          <li>阵营是你角色的道德指南针，不是束缚</li>
          <li>你的角色可以做出与阵营不完全一致的行为</li>
          <li>随着角色发展，阵营可能会改变</li>
          <li>阵营主要用于角色扮演，对游戏机制影响很小</li>
          <li>善良阵营适合大多数冒险队伍</li>
        </ul>
      </div>

      {/* 与职业的关联 */}
      {currentCharacter.class && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 text-sm">
          <div className="font-bold text-blue-900 mb-2">🎯 {currentCharacter.class}的阵营建议</div>
          <div className="text-blue-800">
            {currentCharacter.class === '圣武士' && (
              <p>圣武士通常是<strong>守序善良</strong>或<strong>中立善良</strong>，但2024版允许其他阵营。</p>
            )}
            {currentCharacter.class === '牧师' && (
              <p>牧师的阵营通常与他们侍奉的神祗一致。善良、中立和邪恶神祗都存在。</p>
            )}
            {currentCharacter.class === '野蛮人' && (
              <p>野蛮人常常是<strong>混乱</strong>阵营，但也有遵循部落传统的守序野蛮人。</p>
            )}
            {!['圣武士', '牧师', '野蛮人'].includes(currentCharacter.class as string) && (
              <p>大多数职业可以是任何阵营。选择最符合你角色概念的阵营。</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
