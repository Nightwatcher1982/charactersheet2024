'use client';

import { useState, useEffect } from 'react';
import { X, Check, Search, Wand2, Sparkles } from 'lucide-react';
import { getCantripsForClass, getFirstLevelSpellsForClass, getSpellsForClassByLevel, getSpellById, Spell } from '@/lib/spells-data';

interface AddSpellModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (spellIds: string[]) => void;
  selectedClass: string;
  spellLevel: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9; // 0 = 戏法, 1–9 = 对应环位
  alreadySelected: string[]; // 已经在角色卡中的法术
  title: string;
  description: string;
}

export default function AddSpellModal({
  isOpen,
  onClose,
  onComplete,
  selectedClass,
  spellLevel,
  alreadySelected,
  title,
  description
}: AddSpellModalProps) {
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      // 禁用body滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复body滚动
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // 清理函数 - 只在组件卸载时执行
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!isOpen) return null;

  // 获取可用法术列表
  const allSpells = spellLevel === 0
    ? getCantripsForClass(selectedClass)
    : spellLevel === 1
      ? getFirstLevelSpellsForClass(selectedClass)
      : getSpellsForClassByLevel(selectedClass, spellLevel);

  // 过滤掉已经在角色卡中的法术
  const availableSpells = allSpells.filter(spell => !alreadySelected.includes(spell.id));

  // 根据搜索词过滤
  const filteredSpells = availableSpells.filter(spell => 
    searchTerm === '' ||
    spell.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spell.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spell.school.includes(searchTerm)
  );

  const toggleSpell = (spellId: string) => {
    setSelectedSpells(prev => 
      prev.includes(spellId) 
        ? prev.filter(id => id !== spellId)
        : [...prev, spellId]
    );
  };

  const handleComplete = () => {
    if (selectedSpells.length > 0) {
      onComplete(selectedSpells);
      setSelectedSpells([]);
      setSearchTerm('');
    }
  };

  const handleClose = () => {
    setSelectedSpells([]);
    setSearchTerm('');
    onClose();
  };

  // 构建一个包含 class 信息的 character 对象用于显示
  const character = { class: selectedClass };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50" onClick={handleClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - 深色主题 */}
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-cinzel font-bold">{title}</h2>
              <p className="text-sm text-purple-100 mt-1">{description}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 搜索栏 - 浅色背景 */}
        <div className="px-6 py-4 bg-purple-50 border-b-2 border-purple-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="add-spell-search"
              name="spellSearch"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索法术名称或学派..."
              className="w-full pl-10 pr-4 py-2 border-2 border-purple-300 rounded-lg focus:border-purple-600 focus:ring-2 focus:ring-purple-200 focus:outline-none bg-white text-gray-900 placeholder-gray-500"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm text-gray-700">
              已选择 <strong className="text-purple-700">{selectedSpells.length}</strong> 个法术
            </p>
            {availableSpells.length === 0 && (
              <p className="text-xs text-orange-600 font-semibold">所有可用法术都已添加</p>
            )}
          </div>
        </div>

        {/* 法术列表 - 白色背景 */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6">
          {filteredSpells.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSpells.map(spell => {
                const isSelected = selectedSpells.includes(spell.id);
                return (
                  <div
                    key={spell.id}
                    onClick={() => toggleSpell(spell.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 shadow-lg'
                        : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-bold text-purple-900 text-base">
                          {spell.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {spell.nameEn}
                        </p>
                        <div className="text-sm text-purple-700 mt-1 flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-purple-100 rounded text-xs">
                            {spell.school}
                          </span>
                          <span className="text-xs text-gray-600">
                            {spellLevel === 0 ? '戏法' : `${spellLevel}环`} · {spell.castingTime}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-6 h-6 text-purple-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                      {spell.description}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                {spellLevel === 0 ? (
                  <span className="text-4xl">🪄</span>
                ) : (
                  <span className="text-4xl">✨</span>
                )}
              </div>
              {availableSpells.length === 0 ? (
                <div>
                  <p className="text-gray-600 font-semibold text-lg mb-2">
                    所有可用法术都已添加
                  </p>
                  <p className="text-gray-500 text-sm">
                    你已经学会了所有 {selectedClass} 的 {spellLevel === 0 ? '戏法' : `${spellLevel}环法术`}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 font-semibold text-lg mb-2">
                    没有找到匹配的法术
                  </p>
                  <p className="text-gray-500 text-sm">
                    尝试搜索其他关键词
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - 固定底部 */}
        <div className="px-6 py-4 bg-white border-t-2 border-purple-200 flex justify-between items-center flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-bold transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleComplete}
            disabled={selectedSpells.length === 0}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors shadow-lg"
          >
            确认添加 ({selectedSpells.length})
          </button>
        </div>
      </div>
    </div>
  );
}
