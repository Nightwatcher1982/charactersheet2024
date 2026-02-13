'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Sparkles, Search } from 'lucide-react';
import { 
  getCantripsForClass, 
  getFirstLevelSpellsForClass, 
  Spell,
  getSpellcastingRules,
  hasSpellcasting
} from '@/lib/spells-data';
import { useCharacterStore } from '@/lib/character-store';

interface SpellSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClass: string;
  onComplete: (cantrips: string[], firstLevelSpells: string[], preparedSpells?: string[]) => void;
  initialCantrips?: string[];
  initialFirstLevelSpells?: string[];
  initialPreparedSpells?: string[];
}

export default function SpellSelectorModal({
  isOpen,
  onClose,
  selectedClass,
  onComplete,
  initialCantrips = [],
  initialFirstLevelSpells = [],
  initialPreparedSpells = []
}: SpellSelectorModalProps) {
  const { currentCharacter } = useCharacterStore();
  const [currentPage, setCurrentPage] = useState<'cantrips' | 'first-level' | 'prepare'>('cantrips');
  const [selectedCantrips, setSelectedCantrips] = useState<string[]>(initialCantrips);
  const [selectedFirstLevelSpells, setSelectedFirstLevelSpells] = useState<string[]>(initialFirstLevelSpells);
  const [selectedPreparedSpells, setSelectedPreparedSpells] = useState<string[]>(initialPreparedSpells);
  const [spellSearch, setSpellSearch] = useState('');

  // 使用 useRef 跟踪模态框是否已经初始化，避免重复初始化
  const hasInitializedRef = useRef(false);
  
  // 只在模态框首次打开时初始化，不依赖 initialCantrips 等（避免状态被重置）
  useEffect(() => {
    if (isOpen && !hasInitializedRef.current) {
      setSelectedCantrips(initialCantrips);
      setSelectedFirstLevelSpells(initialFirstLevelSpells);
      setSelectedPreparedSpells(initialPreparedSpells);
      setCurrentPage('cantrips');
      hasInitializedRef.current = true;
      // 禁用body滚动
      document.body.style.overflow = 'hidden';
    } else if (!isOpen) {
      // 模态框关闭时重置标志
      hasInitializedRef.current = false;
      // 恢复body滚动
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]); // 只依赖 isOpen，避免状态被意外重置

  // 清理函数 - 只在组件卸载时执行
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!isOpen || !hasSpellcasting(selectedClass)) return null;

  const spellcastingRules = getSpellcastingRules(
    selectedClass, 
    currentCharacter?.level || 1,
    currentCharacter?.classFeatureChoices
  );

  if (!spellcastingRules) {
    console.error('Spellcasting rules not found for class:', selectedClass);
    return null;
  }

  // 确保 cantripsKnown 有有效值
  if (!spellcastingRules.cantripsKnown || spellcastingRules.cantripsKnown <= 0) {
    console.error('Invalid cantripsKnown:', spellcastingRules.cantripsKnown, 'for class:', selectedClass);
  }

  const availableCantrips = getCantripsForClass(selectedClass);
  const availableFirstLevelSpells = getFirstLevelSpellsForClass(selectedClass);

  const filterSpellsBySearch = (list: Spell[], q: string) => {
    if (!q.trim()) return list;
    const lower = q.trim().toLowerCase();
    return list.filter(
      (s) =>
        s.name.includes(q.trim()) ||
        s.nameEn.toLowerCase().includes(lower) ||
        s.name.toLowerCase().includes(lower)
    );
  };

  const filteredCantrips = useMemo(
    () => filterSpellsBySearch(availableCantrips, spellSearch),
    [availableCantrips, spellSearch]
  );
  const filteredFirstLevel = useMemo(
    () => filterSpellsBySearch(availableFirstLevelSpells, spellSearch),
    [availableFirstLevelSpells, spellSearch]
  );
  const filteredForPrepare = useMemo(() => {
    const inSpellbook = selectedFirstLevelSpells
      .map((id) => availableFirstLevelSpells.find((s) => s.id === id))
      .filter(Boolean) as Spell[];
    return filterSpellsBySearch(inSpellbook, spellSearch);
  }, [selectedFirstLevelSpells, availableFirstLevelSpells, spellSearch]);

  // 法师：两步（法术书 -> 准备法术）。其他职业：直接选择“准备法术”列表。
  const isWizard = selectedClass === '法师';
  const spellbookTargetRaw = isWizard ? (spellcastingRules.spellbookSpellsKnown || 0) : 0;
  const spellbookTarget = isWizard ? Math.min(spellbookTargetRaw, availableFirstLevelSpells.length) : 0;
  const preparedTargetRaw = spellcastingRules.preparedSpells || 0;
  const preparedTarget = Math.min(preparedTargetRaw, availableFirstLevelSpells.length);
  const needsPrepareStep = isWizard && preparedTargetRaw > 0;

  const toggleCantrip = (spellId: string) => {
    setSelectedCantrips(prevCantrips => {
      if (prevCantrips.includes(spellId)) {
        // 如果已选择，则取消选择
        return prevCantrips.filter(id => id !== spellId);
      } else if (prevCantrips.length < spellcastingRules.cantripsKnown) {
        // 如果未达到上限，则添加
        return [...prevCantrips, spellId];
      }
      // 已达到上限，不添加
      return prevCantrips;
    });
  };

  const toggleFirstLevelSpell = (spellId: string) => {
    if (selectedFirstLevelSpells.includes(spellId)) {
      setSelectedFirstLevelSpells(selectedFirstLevelSpells.filter(id => id !== spellId));
      // 法师：如果从法术书中移除，也从准备列表中移除
      if (isWizard && selectedPreparedSpells.includes(spellId)) {
        setSelectedPreparedSpells(selectedPreparedSpells.filter(id => id !== spellId));
      }
    } else {
      if (isWizard) {
        // 法师：法术书上限
        if (selectedFirstLevelSpells.length < spellbookTarget) {
          setSelectedFirstLevelSpells([...selectedFirstLevelSpells, spellId]);
        }
      } else {
        // 其他职业：准备法术上限
        if (selectedFirstLevelSpells.length < preparedTarget) {
        setSelectedFirstLevelSpells([...selectedFirstLevelSpells, spellId]);
        }
      }
    }
  };

  const togglePreparedSpell = (spellId: string) => {
    if (selectedPreparedSpells.includes(spellId)) {
      setSelectedPreparedSpells(selectedPreparedSpells.filter(id => id !== spellId));
    } else if (selectedPreparedSpells.length < preparedTargetRaw) {
      // 只能从法术书中的法术选择
      if (selectedFirstLevelSpells.includes(spellId)) {
        setSelectedPreparedSpells([...selectedPreparedSpells, spellId]);
      }
    }
  };

  const handleConfirm = () => {
    if (needsPrepareStep && currentPage === 'prepare') {
      // 法师：传递法术书和准备法术
      onComplete(selectedCantrips, selectedFirstLevelSpells, selectedPreparedSpells);
    } else {
      // 其他职业：传递准备法术
      onComplete(selectedCantrips, selectedFirstLevelSpells);
    }
    onClose();
  };

  const canProceedToFirstLevel = selectedCantrips.length === spellcastingRules.cantripsKnown;
  
  // 法师：完成法术书选择后，进入准备步骤
  const canProceedToPrepare = isWizard && 
    currentPage === 'first-level' && 
    selectedFirstLevelSpells.length === spellbookTarget;
  
  // 完成条件：法师需要完成准备步骤；其他职业在一环页选满准备法术数即可
  const canComplete = (
    (currentPage === 'first-level' && !needsPrepareStep && selectedFirstLevelSpells.length === preparedTarget) ||
    (currentPage === 'prepare' && needsPrepareStep && selectedPreparedSpells.length === preparedTargetRaw)
  );

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {currentPage === 'cantrips' ? '选择戏法' : 
               currentPage === 'prepare' ? '选择准备法术' : 
               '选择一环法术'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 说明信息 */}
        <div className="px-4 py-2 bg-purple-50 border-b flex-shrink-0">
          {currentPage === 'cantrips' ? (
            <div className="text-sm text-gray-700">
              <p className="font-semibold">职业：{selectedClass}</p>
              <p>请选择 <span className="font-bold text-purple-600">{spellcastingRules.cantripsKnown}</span> 个戏法</p>
              <p className="text-xs text-gray-600 mt-1">已选择：{selectedCantrips.length} / {spellcastingRules.cantripsKnown}</p>
            </div>
          ) : currentPage === 'prepare' ? (
            <div className="text-sm text-gray-700">
              <p className="font-semibold">职业：{selectedClass}</p>
              <p>从法术书中选择 <span className="font-bold text-purple-600">{preparedTargetRaw}</span> 个法术准备</p>
              <p className="text-xs text-gray-600 mt-1">已准备：{selectedPreparedSpells.length} / {preparedTargetRaw}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-700">
              <p className="font-semibold">职业：{selectedClass}</p>
              {isWizard ? (
                <>
                  <p>
                    请选择 <span className="font-bold text-purple-600">{spellbookTarget}</span> 个一环法术放入法术书
                    {spellbookTargetRaw !== spellbookTarget ? (
                      <span className="text-xs text-gray-500">（受当前一环法术数据数量限制）</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    已选择：{selectedFirstLevelSpells.length} / {spellbookTarget}（之后从法术书中准备 {preparedTargetRaw} 个）
                  </p>
                </>
              ) : (
                <>
                  <p>
                    请选择 <span className="font-bold text-purple-600">{preparedTarget}</span> 个一环法术作为准备法术
                    {preparedTargetRaw !== preparedTarget ? (
                      <span className="text-xs text-gray-500">（受当前一环法术数据数量限制）</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">已选择：{selectedFirstLevelSpells.length} / {preparedTarget}</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* 搜索：戏法/一环/准备法术列表均支持按中文名或英文名筛选 */}
        <div className="px-4 py-2 border-b flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={spellSearch}
              onChange={(e) => setSpellSearch(e.target.value)}
              placeholder="搜索法术（中文名或英文名）"
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            {spellSearch && (
              <button
                type="button"
                onClick={() => setSpellSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                清除
              </button>
            )}
          </div>
        </div>

        {/* 法术列表 */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          {currentPage === 'cantrips' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCantrips.map((spell) => {
                const isSelected = selectedCantrips.includes(spell.id);
                const canSelect = selectedCantrips.length < spellcastingRules.cantripsKnown || isSelected;
                
                return (
                  <button
                    key={spell.id}
                    type="button"
                    onClick={() => toggleCantrip(spell.id)}
                    disabled={!canSelect && !isSelected}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50'
                        : canSelect
                        ? 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{spell.name}</h3>
                          <span className="text-xs text-gray-500">({spell.nameEn})</span>
                          {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {spell.school} · {spell.castingTime} · {spell.range}
                        </p>
                        <p className="text-xs text-gray-700 line-clamp-2">{spell.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {spellSearch && filteredCantrips.length === 0 && (
                <p className="col-span-full text-sm text-gray-500 py-4">无匹配戏法，可修改搜索词或清空。</p>
              )}
            </div>
          ) : currentPage === 'prepare' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredForPrepare.map((spell) => {
                const spellId = spell.id;
                const isPrepared = selectedPreparedSpells.includes(spellId);
                const canSelect = selectedPreparedSpells.length < preparedTargetRaw || isPrepared;
                
                return (
                  <button
                    key={spellId}
                    onClick={() => togglePreparedSpell(spellId)}
                    disabled={!canSelect && !isPrepared}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      isPrepared
                        ? 'border-purple-600 bg-purple-50'
                        : canSelect
                        ? 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{spell.name}</h3>
                          <span className="text-xs text-gray-500">({spell.nameEn})</span>
                          {isPrepared && <Check className="w-4 h-4 text-purple-600" />}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {spell.school} · 一环 · {spell.castingTime} · {spell.range}
                        </p>
                        <p className="text-xs text-gray-700 line-clamp-2">{spell.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {spellSearch && filteredForPrepare.length === 0 && (
                <p className="col-span-full text-sm text-gray-500 py-4">无匹配法术，可修改搜索词或清空。</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFirstLevel.map((spell) => {
                const isSelected = selectedFirstLevelSpells.includes(spell.id);
                const limit = isWizard ? spellbookTarget : preparedTarget;
                const canSelect = selectedFirstLevelSpells.length < limit || isSelected;
                
                return (
                  <button
                    key={spell.id}
                    onClick={() => toggleFirstLevelSpell(spell.id)}
                    disabled={!canSelect && !isSelected}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50'
                        : canSelect
                        ? 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{spell.name}</h3>
                          <span className="text-xs text-gray-500">({spell.nameEn})</span>
                          {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                          {spell.ritual && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">仪式</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          {spell.school} · 一环 · {spell.castingTime} · {spell.range}
                        </p>
                        <p className="text-xs text-gray-700 line-clamp-2">{spell.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
              {spellSearch && filteredFirstLevel.length === 0 && (
                <p className="col-span-full text-sm text-gray-500 py-4">无匹配一环法术，可修改搜索词或清空。</p>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-4 border-t bg-white flex-shrink-0">
          <div className="flex gap-2">
            {currentPage === 'first-level' && (
              <button
                onClick={() => setCurrentPage('cantrips')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                返回戏法
              </button>
            )}
            {currentPage === 'prepare' && (
              <button
                onClick={() => setCurrentPage('first-level')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                返回法术书
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            {currentPage === 'cantrips' ? (
              <button
                onClick={() => setCurrentPage('first-level')}
                disabled={!canProceedToFirstLevel}
                className={`px-4 py-2 rounded transition-colors ${
                  canProceedToFirstLevel
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                下一步：选择一环法术
              </button>
            ) : currentPage === 'first-level' && needsPrepareStep ? (
              <button
                onClick={() => setCurrentPage('prepare')}
                disabled={!canProceedToPrepare}
                className={`px-4 py-2 rounded transition-colors ${
                  canProceedToPrepare
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                下一步：选择准备法术
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={!canComplete}
                className={`px-4 py-2 rounded transition-colors ${
                  canComplete
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                确认
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
