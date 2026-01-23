'use client';

import { useCharacterStore } from '@/lib/character-store';
import { ALIGNMENTS } from '@/lib/dnd-data';

export default function StepBasicInfo() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();

  if (!currentCharacter) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">基本信息</h2>
        <p className="text-gray-600 mb-6">
          让我们从基本信息开始。输入你的角色名字、等级和阵营。
        </p>
      </div>

      <div className="info-box">
        <p className="text-sm text-blue-800">
          💡 <strong>提示：</strong>角色名字可以随时修改。如果你还没想好，可以先使用占位名称。
        </p>
      </div>

      <div>
        <label className="label">
          角色名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className="input"
          placeholder="例如：艾莉亚、索林、加里昂..."
          value={currentCharacter.name || ''}
          onChange={(e) => updateCurrentCharacter({ name: e.target.value })}
        />
      </div>

      <div>
        <label className="label">
          角色等级
        </label>
        <input
          type="number"
          className="input"
          min="1"
          max="20"
          value={currentCharacter.level || 1}
          onChange={(e) => updateCurrentCharacter({ level: parseInt(e.target.value) || 1 })}
        />
        <p className="text-sm text-gray-500 mt-1">
          大多数新角色从 1 级开始冒险
        </p>
      </div>

      <div>
        <label className="label">
          阵营 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {ALIGNMENTS.map((alignment) => (
            <button
              key={alignment.id}
              onClick={() => updateCurrentCharacter({ alignment: alignment.name })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                currentCharacter.alignment === alignment.name
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="font-bold text-gray-900">{alignment.name}</div>
              <div className="text-xs text-gray-500 mt-1">{alignment.nameEn}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="info-box">
        <div className="text-sm text-blue-800">
          <strong>关于阵营：</strong>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>守序</strong>：重视秩序、传统和法律</li>
            <li><strong>中立</strong>：在秩序与混乱之间保持平衡</li>
            <li><strong>混乱</strong>：珍视自由和个性</li>
            <li><strong>善良</strong>：关心他人的福祉</li>
            <li><strong>中立</strong>：不偏向善恶任何一方</li>
            <li><strong>邪恶</strong>：为了自身利益不择手段</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
