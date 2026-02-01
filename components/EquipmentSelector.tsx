'use client';

import { useState, useEffect } from 'react';
import { getBackgroundEquipment, formatEquipmentList } from '@/lib/equipment-packages-data';
import { Check, Package, Coins } from 'lucide-react';

interface EquipmentSelectorProps {
  backgroundId: string;
  backgroundName: string;
  initialChoice?: 'A' | 'B';
  onComplete: (choice: 'A' | 'B') => void;
  autoConfirm?: boolean; // 是否自动确认
  showConfirmButton?: boolean; // 是否显示内部确认按钮
}

export default function EquipmentSelector({
  backgroundId,
  backgroundName,
  initialChoice,
  onComplete,
  autoConfirm = false,
  showConfirmButton = true
}: EquipmentSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(initialChoice || null);
  
  const equipment = getBackgroundEquipment(backgroundId);

  useEffect(() => {
    // 只有在 autoConfirm 为 true 时才自动触发完成
    if (autoConfirm && selectedOption) {
      onComplete(selectedOption);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption, autoConfirm]);

  if (!equipment) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-4 text-sm text-red-700">
        未找到背景&ldquo;{backgroundName}&rdquo;的装备数据
      </div>
    );
  }

  const handleSelect = (option: 'A' | 'B') => {
    setSelectedOption(option);
    // 立即调用 onComplete 更新父组件状态
    onComplete(option);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onComplete(selectedOption);
    }
  };

  return (
    <div className="space-y-4">
      {/* 说明 */}
      <div className="px-6 py-3 bg-blue-50 border-b-2 border-blue-100">
        <p className="text-sm text-blue-800">
          你的背景提供两种装备选项。选择最适合你角色的一种。
        </p>
      </div>

      {/* 选项A：装备包 */}
      <button
        type="button"
        id="background-equipment-option-a"
        name="backgroundEquipment"
        onClick={() => handleSelect('A')}
        className={`w-full p-5 rounded-lg border-2 transition-all text-left bg-white ${
          selectedOption === 'A'
            ? 'border-purple-600 bg-purple-50'
            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Package className={`w-6 h-6 ${selectedOption === 'A' ? 'text-purple-600' : 'text-gray-400'}`} />
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
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
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
              <Check className="w-6 h-6 text-purple-600" />
            </div>
          )}
        </div>
      </button>

      {/* 选项B：金币 */}
      <button
        type="button"
        id="background-equipment-option-b"
        name="backgroundEquipment"
        onClick={() => handleSelect('B')}
        className={`w-full p-5 rounded-lg border-2 transition-all text-left bg-white ${
          selectedOption === 'B'
            ? 'border-purple-600 bg-purple-50'
            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Coins className={`w-6 h-6 ${selectedOption === 'B' ? 'text-purple-600' : 'text-gray-400'}`} />
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
              <Check className="w-6 h-6 text-purple-600" />
            </div>
          )}
        </div>
      </button>

      {/* 完成提示 */}
      {selectedOption && (
        <div className="bg-purple-50 border-2 border-purple-500 rounded-lg p-4 text-center">
          <div className="text-purple-700 font-bold">
            ✓ 已选择：选项 {selectedOption}
          </div>
          <div className="text-purple-600 text-sm mt-1">
            {selectedOption === 'A' 
              ? '你将获得完整的装备包' 
              : `你将获得 ${equipment.optionB.gold} 金币`}
          </div>
        </div>
      )}

      {/* 确认按钮 - 只在非自动确认模式且设置显示时才显示 */}
      {/* 确认按钮 - 只在非自动确认且设置显示时才显示 */}
      {!autoConfirm && showConfirmButton && selectedOption && (
        <button
          type="button"
          id="background-equipment-confirm"
          onClick={handleConfirm}
          className="w-full py-2.5 px-6 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <Check className="w-5 h-5" />
          <span>确认装备选择</span>
        </button>
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
