'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { Plus, Trash2 } from 'lucide-react';

const COMMON_EQUIPMENT = {
  weapons: ['长剑', '短剑', '战斧', '战锤', '长弓', '短弓', '弩', '匕首', '长矛', '木棍'],
  armor: ['皮甲', '镶钉皮甲', '链甲', '鳞甲', '板甲', '盾牌'],
  adventuringGear: [
    '背包', '睡袋', '绳索（50尺）', '火把（10支）', '口粮（10天）',
    '水袋', '盗贼工具', '医疗包', '撬棍', '铁钉（10个）'
  ],
};

export default function StepEquipment() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [customItem, setCustomItem] = useState('');

  if (!currentCharacter) return null;

  const equipment = currentCharacter.equipment || [];

  const addEquipment = (item: string) => {
    if (!equipment.includes(item)) {
      updateCurrentCharacter({
        equipment: [...equipment, item],
      });
    }
  };

  const removeEquipment = (item: string) => {
    updateCurrentCharacter({
      equipment: equipment.filter((e) => e !== item),
    });
  };

  const addCustomItem = () => {
    if (customItem.trim() && !equipment.includes(customItem.trim())) {
      addEquipment(customItem.trim());
      setCustomItem('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">选择装备</h2>
        <p className="text-gray-600 mb-6">
          选择你的初始装备。你可以从常用装备中选择，也可以添加自定义物品。
        </p>
      </div>

      <div className="info-box">
        <p className="text-sm text-blue-800">
          💡 <strong>提示：</strong>你的职业决定了你可以熟练使用的武器和护甲。
          确保选择的装备符合你的职业熟练项。
        </p>
      </div>

      {/* 已选装备 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          已选装备 ({equipment.length})
        </h3>
        {equipment.length > 0 ? (
          <div className="space-y-2">
            {equipment.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span className="text-gray-900">{item}</span>
                <button
                  onClick={() => removeEquipment(item)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">还没有选择装备</p>
          </div>
        )}
      </div>

      {/* 添加自定义物品 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          添加自定义物品
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomItem()}
            placeholder="输入物品名称..."
            className="input flex-1"
          />
          <button
            onClick={addCustomItem}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            添加
          </button>
        </div>
      </div>

      {/* 武器 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">武器</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {COMMON_EQUIPMENT.weapons.map((weapon) => (
            <button
              key={weapon}
              onClick={() => addEquipment(weapon)}
              disabled={equipment.includes(weapon)}
              className={`p-3 rounded-lg border transition-all text-sm ${
                equipment.includes(weapon)
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-900 border-gray-300 hover:border-red-500 hover:bg-red-50'
              }`}
            >
              {weapon}
            </button>
          ))}
        </div>
      </div>

      {/* 护甲 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">护甲</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {COMMON_EQUIPMENT.armor.map((armor) => (
            <button
              key={armor}
              onClick={() => addEquipment(armor)}
              disabled={equipment.includes(armor)}
              className={`p-3 rounded-lg border transition-all text-sm ${
                equipment.includes(armor)
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-900 border-gray-300 hover:border-red-500 hover:bg-red-50'
              }`}
            >
              {armor}
            </button>
          ))}
        </div>
      </div>

      {/* 冒险装备 */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">冒险装备</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {COMMON_EQUIPMENT.adventuringGear.map((gear) => (
            <button
              key={gear}
              onClick={() => addEquipment(gear)}
              disabled={equipment.includes(gear)}
              className={`p-3 rounded-lg border transition-all text-sm text-left ${
                equipment.includes(gear)
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : 'bg-white text-gray-900 border-gray-300 hover:border-red-500 hover:bg-red-50'
              }`}
            >
              {gear}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
