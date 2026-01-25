'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Check, Sparkles, BookOpen } from 'lucide-react';
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
    } else if (!isOpen) {
      // 模态框关闭时重置标志
      hasInitializedRef.current = false;
    }
  }, [isOpen]); // 只依赖 isOpen，避免状态被意外重置

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
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
        <div className="px-4 py-2 bg-purple-50 border-b">
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

        {/* 法术列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {currentPage === 'cantrips' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableCantrips.map((spell) => {
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
            </div>
          ) : currentPage === 'prepare' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedFirstLevelSpells.map((spellId) => {
                const spell = availableFirstLevelSpells.find(s => s.id === spellId);
                if (!spell) return null;
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
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFirstLevelSpells.map((spell) => {
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
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
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
}
