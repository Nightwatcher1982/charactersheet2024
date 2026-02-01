'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { Sparkles, Wand2, Check, Circle } from 'lucide-react';
import { getSpellsByClass, getClassSpellInfo } from '@/lib/spells-data';

type TabType = 'cantrips' | 'spells';

export default function StepSpellCheck() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [activeTab, setActiveTab] = useState<TabType>('cantrips');
  const [preparedSpells, setPreparedSpells] = useState<string[]>(
    currentCharacter?.classFeatureChoices?.selectedPreparedSpells
      ? JSON.parse(currentCharacter.classFeatureChoices.selectedPreparedSpells as string)
      : []
  );

  if (!currentCharacter || !currentCharacter.class) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="section-title">法术检查</h2>
          <p className="text-gray-600">请先选择职业。</p>
        </div>
      </div>
    );
  }

  const spellInfo = getClassSpellInfo(currentCharacter.class);
  
  if (!spellInfo) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="section-title">法术检查</h2>
          <p className="text-gray-600 mb-4">你的职业（{currentCharacter.class}）不是施法职业。</p>
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 text-center">
            <Wand2 className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">非施法职业不需要管理法术。</p>
          </div>
        </div>
      </div>
    );
  }

  // 获取已选择的戏法和法术
  const selectedCantrips = currentCharacter.classFeatureChoices?.selectedCantrips
    ? JSON.parse(currentCharacter.classFeatureChoices.selectedCantrips as string)
    : [];
  
  const selectedFirstLevelSpells = currentCharacter.classFeatureChoices?.selectedFirstLevelSpells
    ? JSON.parse(currentCharacter.classFeatureChoices.selectedFirstLevelSpells as string)
    : [];

  // 调试信息
  console.log('StepSpellCheck - Class:', currentCharacter.class);
  console.log('StepSpellCheck - classFeatureChoices:', currentCharacter.classFeatureChoices);
  console.log('StepSpellCheck - selectedCantrips:', selectedCantrips);
  console.log('StepSpellCheck - selectedFirstLevelSpells:', selectedFirstLevelSpells);

  // 获取戏法和1级法术的详细信息
  const allSpells = getSpellsByClass(currentCharacter.class);
  const cantripDetails = allSpells.cantrips.filter(spell => 
    selectedCantrips.includes(spell.id) // ✅ 使用 spell.id 而不是 spell.name
  );
  const spellDetails = allSpells.level1.filter(spell => 
    selectedFirstLevelSpells.includes(spell.id) // ✅ 使用 spell.id 而不是 spell.name
  );

  console.log('StepSpellCheck - cantripDetails:', cantripDetails);
  console.log('StepSpellCheck - spellDetails:', spellDetails);

  // 计算最大准备法术数量
  const maxPreparedSpells = spellInfo.isPrepared
    ? spellInfo.preparedCount || 0
    : selectedFirstLevelSpells.length;

  // 处理准备/取消准备法术
  const togglePrepareSpell = (spellId: string) => {
    let newPreparedSpells: string[];
    
    if (preparedSpells.includes(spellId)) {
      // 取消准备
      newPreparedSpells = preparedSpells.filter(s => s !== spellId);
    } else {
      // 准备法术
      if (preparedSpells.length >= maxPreparedSpells) {
        alert(`你最多只能准备 ${maxPreparedSpells} 个法术！`);
        return;
      }
      newPreparedSpells = [...preparedSpells, spellId];
    }
    
    setPreparedSpells(newPreparedSpells);
    
    // 更新到角色数据
    const updatedChoices = {
      ...(currentCharacter.classFeatureChoices || {}),
      selectedPreparedSpells: JSON.stringify(newPreparedSpells)
    };
    
    updateCurrentCharacter({
      classFeatureChoices: updatedChoices
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">法术检查</h2>
        <p className="text-gray-600 mb-6">
          查看你已选择的戏法和法术。{spellInfo.isPrepared && '你需要准备法术才能施放。'}
        </p>
      </div>

      {/* 页签切换 */}
      <div className="flex gap-2 border-b-2 border-leather-light">
        <button
          onClick={() => setActiveTab('cantrips')}
          className={`px-6 py-3 font-bold transition-all border-b-4 ${
            activeTab === 'cantrips'
              ? 'border-gold-dark text-gold-dark bg-gold-light/20'
              : 'border-transparent text-leather-base hover:text-leather-dark hover:bg-parchment-base'
          }`}
        >
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            <span>戏法</span>
            <span className="text-sm">
              {selectedCantrips.length}/{spellInfo.cantripsKnown}
            </span>
          </div>
        </button>
        
        <button
          onClick={() => setActiveTab('spells')}
          className={`px-6 py-3 font-bold transition-all border-b-4 ${
            activeTab === 'spells'
              ? 'border-gold-dark text-gold-dark bg-gold-light/20'
              : 'border-transparent text-leather-base hover:text-leather-dark hover:bg-parchment-base'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>法术</span>
            <span className="text-sm">
              {selectedFirstLevelSpells.length}/{spellInfo.spellsKnown || '∞'}
            </span>
          </div>
        </button>
      </div>

      {/* 戏法列表 */}
      {activeTab === 'cantrips' && (
        <div className="space-y-3">
          {cantripDetails.length > 0 ? (
            <>
              <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-lg">
                <p className="text-sm text-purple-800">
                  <strong>戏法：</strong>可以无限施放，不需要准备。
                </p>
              </div>
              
              {cantripDetails.map((cantrip) => (
                <div
                  key={cantrip.name}
                  className="p-4 bg-white rounded-lg border-2 border-purple-200 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-leather-dark text-lg">{cantrip.name}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        {cantrip.school} | 施法时间: {cantrip.castingTime}
                      </div>
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                        {cantrip.description}
                      </p>
                    </div>
                    <Wand2 className="w-5 h-5 text-purple-500 ml-3" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">你还没有选择戏法</p>
            </div>
          )}
        </div>
      )}

      {/* 法术列表 */}
      {activeTab === 'spells' && (
        <div className="space-y-3">
          {spellDetails.length > 0 ? (
            <>
              {/* 准备法术提示 */}
              {spellInfo.isPrepared && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
                  <p className="text-sm text-blue-800">
                    <strong>准备法术：</strong>
                    你已准备 {preparedSpells.length}/{maxPreparedSpells} 个法术。
                    只有准备的法术才能施放。
                  </p>
                </div>
              )}
              
              {spellDetails.map((spell) => {
                const isPrepared = preparedSpells.includes(spell.id); // ✅ 使用 spell.id
                const canPrepare = spellInfo.isPrepared;
                
                return (
                  <div
                    key={spell.id}
                    className={`p-4 rounded-lg border-2 shadow-sm transition-all ${
                      isPrepared
                        ? 'bg-gold-light/30 border-gold-dark ring-2 ring-gold-dark'
                        : 'bg-white border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-leather-dark text-lg">{spell.name}</h4>
                          {canPrepare && (
                            <button
                              onClick={() => togglePrepareSpell(spell.id)} // ✅ 传递 spell.id
                              className={`ml-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                isPrepared
                                  ? 'bg-gold-dark text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {isPrepared ? (
                                <span className="flex items-center gap-1">
                                  <Check className="w-3 h-3" />
                                  已准备
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Circle className="w-3 h-3" />
                                  准备
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {spell.level}级 {spell.school} | 施法时间: {spell.castingTime}
                        </div>
                        <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                          {spell.description}
                        </p>
                        {spell.higherLevel && (
                          <p className="text-xs text-gray-600 mt-2 italic">
                            <strong>升环施法：</strong>{spell.higherLevel}
                          </p>
                        )}
                      </div>
                      <Sparkles className="w-5 h-5 text-blue-500 ml-3" />
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">你还没有选择法术</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
