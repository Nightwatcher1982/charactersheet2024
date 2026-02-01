'use client';

import { useCharacterStore } from '@/lib/character-store';
import { ALIGNMENTS } from '@/lib/dnd-data';
import { Check } from 'lucide-react';

export default function StepAlignment() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();

  if (!currentCharacter) return null;

  // 阵营网格位置
  const alignmentGrid = [
    ['lg', 'ng', 'cg'],
    ['ln', 'tn', 'cn'],
    ['le', 'ne', 'ce']
  ];

  const isEvil = (alignmentId: string) => alignmentId.includes('e') && alignmentId !== 'ne';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">选择阵营</h2>
      </div>

      {/* 阵营网格选择 */}
      <div>

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
    </div>
  );
}
