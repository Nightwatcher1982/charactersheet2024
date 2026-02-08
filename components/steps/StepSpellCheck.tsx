'use client';

import { useState } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { Sparkles, Wand2, Check, Circle, Pencil } from 'lucide-react';
import { getSpellsByClass, getClassSpellInfo, getMagicInitiateSpellInfo, getSpellById, getEffectiveCantrips, getSpeciesGrantedCantrips } from '@/lib/spells-data';
import { getFeatById } from '@/lib/feats-data';
import MagicInitiateSpellModal from '@/components/MagicInitiateSpellModal';
import type { MagicInitiateEntry } from '@/lib/spells-data';
import type { Character } from '@/lib/dnd-data';

type TabType = 'cantrips' | 'spells';

/** 仅魔法学徒专长的法术检查：列出专长戏法 + 一环法术，可编辑 */
function StepSpellCheckMagicInitiateOnly({
  character,
  entries,
  onUpdate,
}: {
  character: Partial<Character>;
  entries: MagicInitiateEntry[];
  onUpdate: (updates: Partial<Character>) => void;
}) {
  const [editingFeatId, setEditingFeatId] = useState<string | null>(null);

  const handleMagicInitiateComplete = (featId: string, choice: { cantrips: string[]; spell: string; ability: string }) => {
    const raw = character.classFeatureChoices?.magicInitiateChoices;
    let choices: Record<string, { cantrips: string[]; spell: string; ability: string }> = {};
    if (raw) {
      try {
        choices = JSON.parse(raw) as Record<string, { cantrips: string[]; spell: string; ability: string }>;
      } catch {
        // ignore
      }
    }
    choices[featId] = choice;
    onUpdate({
      classFeatureChoices: {
        ...(character.classFeatureChoices || {}),
        magicInitiateChoices: JSON.stringify(choices),
      },
    });
    setEditingFeatId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">法术检查</h2>
        <p className="text-gray-600 mb-4">以下为通过魔法学徒专长习得的戏法与一环法术。</p>
      </div>
      {entries.map((entry) => {
        const feat = getFeatById(entry.featId);
        const incomplete = entry.cantrips.length < 2 || !entry.level1Spell;

        return (
          <div key={entry.featId} className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-purple-900">{feat?.name ?? entry.listName}</h3>
              <button
                type="button"
                onClick={() => setEditingFeatId(entry.featId)}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
              >
                <Pencil className="w-4 h-4" />
                编辑
              </button>
            </div>
            {incomplete && (
              <p className="text-amber-700 text-sm mb-2">请完成选择：2 道戏法 + 1 道一环法术。</p>
            )}
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>戏法：</strong>{entry.cantrips.map((id) => getSpellById(id)?.name).filter(Boolean).join('、') || '未选'}</p>
              <p><strong>一环法术：</strong>{entry.level1Spell ? getSpellById(entry.level1Spell)?.name ?? entry.level1Spell : '未选'}</p>
              <p><strong>施法属性：</strong>{entry.ability}</p>
            </div>
          </div>
        );
      })}
      {editingFeatId && (
        <MagicInitiateSpellModal
          isOpen={true}
          onClose={() => setEditingFeatId(null)}
          featId={editingFeatId}
          onComplete={(choice) => handleMagicInitiateComplete(editingFeatId, choice)}
          initialCantrips={entries.find((e) => e.featId === editingFeatId)?.cantrips ?? []}
          initialSpell={entries.find((e) => e.featId === editingFeatId)?.level1Spell ?? ''}
          initialAbility={entries.find((e) => e.featId === editingFeatId)?.ability ?? ''}
        />
      )}
    </div>
  );
}

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
  const magicInitiateInfo = getMagicInitiateSpellInfo(currentCharacter);

  // 非施法职业：若有魔法学徒专长则显示专长法术检查，否则提示
  if (!spellInfo) {
    if (magicInitiateInfo.entries.length === 0) {
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
    return (
      <StepSpellCheckMagicInitiateOnly
        character={currentCharacter}
        entries={magicInitiateInfo.entries}
        onUpdate={(updates) => updateCurrentCharacter(updates)}
      />
    );
  }

  // 有效戏法 = 物种授予（提夫林奇术+遗赠戏法、侏儒血系戏法）+ 职业选择
  const effectiveCantrips = getEffectiveCantrips(currentCharacter);
  const speciesGrantedCantrips = getSpeciesGrantedCantrips(currentCharacter);
  const selectedFirstLevelSpells = currentCharacter.classFeatureChoices?.selectedFirstLevelSpells
    ? JSON.parse(currentCharacter.classFeatureChoices.selectedFirstLevelSpells as string)
    : [];

  // 获取戏法和1级法术的详细信息（戏法用有效列表，含物种授予）
  const allSpells = getSpellsByClass(currentCharacter.class);
  const cantripDetails = effectiveCantrips
    .map(id => getSpellById(id))
    .filter((s): s is NonNullable<typeof s> => !!s);
  const spellDetails = allSpells.level1.filter(spell =>
    selectedFirstLevelSpells.includes(spell.id)
  );

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
              {effectiveCantrips.length}/{spellInfo.cantripsKnown + speciesGrantedCantrips.length}
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
                      <h4 className="font-bold text-leather-dark text-lg">
                        {cantrip.name}
                        {speciesGrantedCantrips.includes(cantrip.id) && (
                          <span className="ml-2 text-sm font-normal text-purple-600">（物种）</span>
                        )}
                      </h4>
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
