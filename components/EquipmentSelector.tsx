'use client';

import { useState, useEffect } from 'react';
import { getBackgroundEquipment, formatEquipmentList } from '@/lib/equipment-packages-data';
import { Check, Package, Coins } from 'lucide-react';

interface EquipmentSelectorProps {
  backgroundId: string;
  backgroundName: string;
  initialChoice?: 'A' | 'B';
  onComplete: (choice: 'A' | 'B') => void;
}

export default function EquipmentSelector({
  backgroundId,
  backgroundName,
  initialChoice,
  onComplete
}: EquipmentSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(initialChoice || null);
  
  const equipment = getBackgroundEquipment(backgroundId);

  useEffect(() => {
    if (selectedOption) {
      onComplete(selectedOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption]); // 只依赖 selectedOption，避免无限循环

  if (!equipment) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-sm text-red-700">
        未找到背景&ldquo;{backgroundName}&rdquo;的装备数据
      </div>
    );
  }

  const handleSelect = (option: 'A' | 'B') => {
    setSelectedOption(option);
  };

  return (
    <div className="space-y-4">
      {/* 说明 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-blue-900 mb-2">选择起始装备</h3>
        <p className="text-sm text-blue-800">
          你的背景提供两种装备选项。选择最适合你角色的一种：
        </p>
      </div>

      {/* 选项A：装备包 */}
      <button
        onClick={() => handleSelect('A')}
        className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
          selectedOption === 'A'
            ? 'border-green-500 bg-green-50 shadow-lg'
            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedOption === 'A' ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg text-gray-900">选项 A：装备包</div>
                <div className="text-xs text-gray-600">适合立即开始冒险</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="text-sm text-gray-700 font-medium mb-2">包含装备：</div>
              <ul className="space-y-1">
                {equipment.optionA.items.map((item, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    {item.name} {item.quantity > 1 && `×${item.quantity}`}
                    {item.nameEn && (
                      <span className="text-xs text-gray-400">({item.nameEn})</span>
                    )}
                  </li>
                ))}
                {equipment.optionA.gold > 0 && (
                  <li className="text-sm text-gray-600 flex items-center gap-2 font-medium">
                    <Coins className="w-4 h-4 text-yellow-600" />
                    {equipment.optionA.gold} 金币
                  </li>
                )}
              </ul>
            </div>
          </div>

          {selectedOption === 'A' && (
            <div className="ml-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </div>
      </button>

      {/* 选项B：金币 */}
      <button
        onClick={() => handleSelect('B')}
        className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
          selectedOption === 'B'
            ? 'border-yellow-500 bg-yellow-50 shadow-lg'
            : 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                selectedOption === 'B' ? 'bg-yellow-500' : 'bg-gray-300'
              }`}>
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg text-gray-900">选项 B：金币</div>
                <div className="text-xs text-gray-600">自由购买你需要的装备</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-3">
                <Coins className="w-8 h-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold text-yellow-700">
                    {equipment.optionB.gold} GP
                  </div>
                  <div className="text-xs text-gray-600">可用于购买任何装备</div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                💡 选择此选项后，你可以在&ldquo;装备&rdquo;章节中查看可购买的物品
              </div>
            </div>
          </div>

          {selectedOption === 'B' && (
            <div className="ml-4">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
          )}
        </div>
      </button>

      {/* 完成提示 */}
      {selectedOption && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <div className="text-green-700 font-bold">
            ✓ 已选择：选项 {selectedOption}
          </div>
          <div className="text-green-600 text-sm mt-1">
            {selectedOption === 'A' 
              ? '你将获得完整的装备包' 
              : `你将获得 ${equipment.optionB.gold} 金币`}
          </div>
        </div>
      )}

      {/* 建议 */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-xs text-gray-700">
        <div className="font-bold mb-2">💡 如何选择？</div>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>选项A（装备包）</strong>：适合新手玩家，提供立即可用的装备组合</li>
          <li><strong>选项B（金币）</strong>：适合有经验的玩家，可以根据角色定位购买特定装备</li>
          <li>50金币通常足够购买基本的武器、护甲和冒险装备</li>
          <li>某些特殊装备（如魔法物品）只能通过冒险获得，无法购买</li>
        </ul>
      </div>
    </div>
  );
}
