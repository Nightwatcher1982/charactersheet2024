'use client';

import { useState } from 'react';
import { Character, getAbilityModifier, getProficiencyBonus } from '@/lib/dnd-data';
import { getSpellById, getClassSpellInfo, getMagicInitiateSpellInfo, type MagicInitiateEntry } from '@/lib/spells-data';
import { getFeatById } from '@/lib/feats-data';
import { Wand2, Sparkles, Zap, Trash2, AlertCircle, Plus, Pencil } from 'lucide-react';
import AddSpellModal from './AddSpellModal';
import MagicInitiateSpellModal from '@/components/MagicInitiateSpellModal';

interface SpellsPageProps {
  character: Partial<Character>;
  onUpdate: (updates: Partial<Character>) => void;
}

type SpellTab = 'cantrips' | 'level1' | 'level2';

/** 仅魔法学徒专长（非施法职业）的法术页：显示专长戏法 + 一环法术，可编辑 */
function MagicInitiateOnlySpellsView({
  character,
  onUpdate,
  entries,
}: {
  character: Partial<Character>;
  onUpdate: (updates: Partial<Character>) => void;
  entries: MagicInitiateEntry[];
}) {
  const [editingFeatId, setEditingFeatId] = useState<string | null>(null);

  const abilities = character.abilities || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };
  const finalAbilities = { ...abilities };
  if (character.backgroundAbilityBonuses) {
    const abilityMap: Record<string, keyof typeof abilities> = {
      '力量': 'strength',
      '敏捷': 'dexterity',
      '体质': 'constitution',
      '智力': 'intelligence',
      '感知': 'wisdom',
      '魅力': 'charisma',
    };
    Object.entries(character.backgroundAbilityBonuses).forEach(([abilityName, bonus]) => {
      const key = abilityMap[abilityName];
      if (key) finalAbilities[key] += bonus;
    });
  }
  const abilityNameToKey: Record<string, keyof typeof abilities> = {
    '智力': 'intelligence',
    '感知': 'wisdom',
    '魅力': 'charisma',
  };
  const profBonus = getProficiencyBonus(character.level || 1);

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
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light p-6">
        <h2 className="text-2xl font-cinzel font-bold text-purple-900 mb-2">魔法学徒（专长）</h2>
        <p className="text-sm text-gray-600 mb-4">
          以下法术来自你通过专长习得的能力，每长休可无偿施放一次一环法术；也可使用法术位施放。
        </p>
        {entries.map((entry) => {
          const abilityKey = abilityNameToKey[entry.ability] || 'intelligence';
          const abilityMod = getAbilityModifier(finalAbilities[abilityKey]);
          const spellSaveDC = 8 + profBonus + abilityMod;
          const spellAttackBonus = profBonus + abilityMod;
          const feat = getFeatById(entry.featId);

          return (
            <div key={entry.featId} className="mb-6 p-4 rounded-xl border-2 border-purple-200 bg-purple-50/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-purple-900">{feat?.name ?? entry.listName}</h3>
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <span>施法属性：{entry.ability}</span>
                  <span>豁免 DC {spellSaveDC}</span>
                  <span>命中 +{spellAttackBonus >= 0 ? '' : ''}{spellAttackBonus}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingFeatId(entry.featId)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                >
                  <Pencil className="w-4 h-4" />
                  编辑
                </button>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-purple-700">戏法（2）</p>
                {entry.cantrips.length > 0 ? (
                  <ul className="space-y-1">
                    {entry.cantrips.map((id) => {
                      const s = getSpellById(id);
                      return s ? (
                        <li key={id} className="text-sm text-gray-800">
                          {s.name} ({s.nameEn}) · {s.school}
                        </li>
                      ) : null;
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">未选择</p>
                )}
                <p className="text-xs font-semibold text-purple-700 mt-2">一环法术（1，每长休可无偿施放一次）</p>
                {entry.level1Spell ? (
                  (() => {
                    const s = getSpellById(entry.level1Spell);
                    return s ? (
                      <p className="text-sm text-gray-800">
                        {s.name} ({s.nameEn}) · {s.school} · {s.castingTime} · {s.range}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">未选择</p>
                    );
                  })()
                ) : (
                  <p className="text-sm text-gray-500">未选择</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

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

export default function SpellsPage({ character, onUpdate }: SpellsPageProps) {
  const [activeTab, setActiveTab] = useState<SpellTab>('cantrips');
  const [showAddCantripModal, setShowAddCantripModal] = useState(false);
  const [showAddSpellModal, setShowAddSpellModal] = useState(false);

  if (!character.class) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light p-8 text-center">
        <p className="text-gray-600">请先选择职业</p>
      </div>
    );
  }

  const spellInfo = getClassSpellInfo(character.class);
  const magicInitiateInfo = getMagicInitiateSpellInfo(character);

  // 非施法职业且无魔法学徒专长：提示
  if (!spellInfo && magicInitiateInfo.entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light p-8 text-center">
        <Wand2 className="w-16 h-16 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">{character.class} 不是施法职业</p>
      </div>
    );
  }

  // 仅魔法学徒专长（非施法职业）：只显示专长法术
  if (!spellInfo && magicInitiateInfo.entries.length > 0) {
    return (
      <MagicInitiateOnlySpellsView character={character} onUpdate={onUpdate} entries={magicInitiateInfo.entries} />
    );
  }

  // 计算施法属性
  const abilities = character.abilities || {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  };

  // 应用背景属性加值
  const finalAbilities = { ...abilities };
  if (character.backgroundAbilityBonuses) {
    Object.entries(character.backgroundAbilityBonuses).forEach(([abilityName, bonus]) => {
      const abilityMap: Record<string, keyof typeof abilities> = {
        '力量': 'strength',
        '敏捷': 'dexterity',
        '体质': 'constitution',
        '智力': 'intelligence',
        '感知': 'wisdom',
        '魅力': 'charisma',
      };
      const key = abilityMap[abilityName];
      if (key) {
        finalAbilities[key] += bonus;
      }
    });
  }

  const profBonus = getProficiencyBonus(character.level || 1);

  // 获取施法属性调整值
  const abilityNameMap: Record<string, keyof typeof abilities> = {
    '智力': 'intelligence',
    '感知': 'wisdom',
    '魅力': 'charisma',
  };
  const spellcastingAbilityKey = abilityNameMap[spellInfo.spellcastingAbility] || 'intelligence';
  const spellcastingAbilityValue = finalAbilities[spellcastingAbilityKey];
  const abilityMod = getAbilityModifier(spellcastingAbilityValue);
  
  // 计算施法数值
  const spellSaveDC = 8 + profBonus + abilityMod;
  const spellAttackBonus = profBonus + abilityMod;

  // 获取已选择的法术
  const selectedCantrips = character.classFeatureChoices?.selectedCantrips
    ? JSON.parse(character.classFeatureChoices.selectedCantrips as string)
    : [];
  
  const selectedFirstLevelSpells = character.classFeatureChoices?.selectedFirstLevelSpells
    ? JSON.parse(character.classFeatureChoices.selectedFirstLevelSpells as string)
    : [];

  const selectedPreparedSpells = character.classFeatureChoices?.selectedPreparedSpells
    ? JSON.parse(character.classFeatureChoices.selectedPreparedSpells as string)
    : [];

  // 移除戏法
  const handleRemoveCantrip = (spellId: string) => {
    if (!confirm('确定要移除这个戏法吗？')) return;
    
    const updated = selectedCantrips.filter((id: string) => id !== spellId);
    const updatedChoices = {
      ...(character.classFeatureChoices || {}),
      selectedCantrips: JSON.stringify(updated)
    };
    onUpdate({ classFeatureChoices: updatedChoices });
  };

  // 移除法术
  const handleRemoveSpell = (spellId: string) => {
    if (!confirm('确定要移除这个法术吗？')) return;
    
    const updated = selectedFirstLevelSpells.filter((id: string) => id !== spellId);
    const updatedPrepared = selectedPreparedSpells.filter((id: string) => id !== spellId);
    const updatedChoices = {
      ...(character.classFeatureChoices || {}),
      selectedFirstLevelSpells: JSON.stringify(updated),
      selectedPreparedSpells: JSON.stringify(updatedPrepared)
    };
    onUpdate({ classFeatureChoices: updatedChoices });
  };

  // 准备/取消准备法术
  const handleTogglePrepare = (spellId: string) => {
    let updated: string[];
    
    if (selectedPreparedSpells.includes(spellId)) {
      updated = selectedPreparedSpells.filter((id: string) => id !== spellId);
    } else {
      if (selectedPreparedSpells.length >= (spellInfo.preparedCount || 0)) {
        alert(`你最多只能准备 ${spellInfo.preparedCount} 个法术！`);
        return;
      }
      updated = [...selectedPreparedSpells, spellId];
    }
    
    const updatedChoices = {
      ...(character.classFeatureChoices || {}),
      selectedPreparedSpells: JSON.stringify(updated)
    };
    onUpdate({ classFeatureChoices: updatedChoices });
  };

  // 添加戏法
  const handleAddCantrips = (cantrips: string[]) => {
    const updatedCantrips = [...new Set([...selectedCantrips, ...cantrips])];
    const updatedChoices = {
      ...(character.classFeatureChoices || {}),
      selectedCantrips: JSON.stringify(updatedCantrips)
    };
    onUpdate({ classFeatureChoices: updatedChoices });
    setShowAddCantripModal(false);
  };

  // 添加法术
  const handleAddSpells = (spells: string[]) => {
    const updatedSpells = [...new Set([...selectedFirstLevelSpells, ...spells])];
    const updatedChoices = {
      ...(character.classFeatureChoices || {}),
      selectedFirstLevelSpells: JSON.stringify(updatedSpells)
    };
    onUpdate({ classFeatureChoices: updatedChoices });
    setShowAddSpellModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 法术统计卡片 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light p-6">
        <h2 className="text-2xl font-cinzel font-bold text-purple-900 mb-4">
          施法能力
        </h2>
        
        {/* 施法数值 - 横向一行显示 */}
        <div className="grid grid-cols-3 gap-6 mb-6 pb-6 border-b-2 border-purple-200">
          <div className="text-center">
            <div className="text-sm text-purple-700 font-semibold mb-1">施法属性</div>
            <div className="text-3xl font-bold text-purple-900">
              {spellInfo.spellcastingAbility}
            </div>
            <div className="text-lg text-purple-600 mt-1">
              {abilityMod >= 0 ? '+' : ''}{abilityMod}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-purple-700 font-semibold mb-1">法术豁免DC</div>
            <div className="text-4xl font-bold text-gold-dark">
              {spellSaveDC}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              8 + {profBonus} + {abilityMod}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-purple-700 font-semibold mb-1">法术命中</div>
            <div className="text-4xl font-bold text-red-600">
              {spellAttackBonus >= 0 ? '+' : ''}{spellAttackBonus}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {profBonus} + {abilityMod}
            </div>
          </div>
        </div>

        {/* 法术统计 - 包含法术位 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">已知戏法</div>
            <div className="text-2xl font-bold text-purple-600">
              {selectedCantrips.length} / {spellInfo.cantripsKnown}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">已知法术</div>
            <div className="text-2xl font-bold text-blue-600">
              {selectedFirstLevelSpells.length}
              {spellInfo.spellsKnown && ` / ${spellInfo.spellsKnown}`}
            </div>
          </div>
          {spellInfo.isPrepared && (
            <div className="text-center">
              <div className="text-xs text-gray-600 mb-1">已准备法术</div>
              <div className="text-2xl font-bold text-gold-dark">
                {selectedPreparedSpells.length} / {spellInfo.preparedCount}
              </div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">一环法术位</div>
            <div className="text-2xl font-bold text-green-600">
              {spellInfo.spellSlots?.level1 || 0}
            </div>
          </div>
        </div>
      </div>

      {/* 页签导航 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light overflow-hidden">
        <div className="flex border-b-2 border-gold-light">
          <button
            onClick={() => setActiveTab('cantrips')}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === 'cantrips'
                ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Wand2 className="w-5 h-5" />
              <span>戏法</span>
              <span className="text-sm">({selectedCantrips.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('level1')}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === 'level1'
                ? 'bg-blue-50 text-blue-700 border-b-4 border-blue-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>一环法术</span>
              <span className="text-sm">({selectedFirstLevelSpells.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('level2')}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === 'level2'
                ? 'bg-cyan-50 text-cyan-700 border-b-4 border-cyan-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              <span>二环法术</span>
              <span className="text-sm">(0)</span>
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* 戏法列表 */}
          {activeTab === 'cantrips' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-lg flex-1">
                  <p className="text-sm text-purple-800">
                    <strong>戏法：</strong>可以无限施放，不需要准备。
                  </p>
                </div>
                <button
                  onClick={() => setShowAddCantripModal(true)}
                  className="ml-3 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-bold"
                >
                  <Plus className="w-4 h-4" />
                  添加戏法
                </button>
              </div>

              {selectedCantrips.length > 0 ? (
                selectedCantrips.map((spellId: string) => {
                  const spell = getSpellById(spellId);
                  if (!spell) return null;

                  return (
                    <div
                      key={spellId}
                      className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-purple-900 text-lg">
                            {spell.name} ({spell.nameEn})
                          </h3>
                          <div className="text-sm text-purple-700 mt-1">
                            {spell.school} · {spell.castingTime} · {spell.range}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <Wand2 className="w-5 h-5 text-purple-600" />
                          <button
                            onClick={() => handleRemoveCantrip(spellId)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {spell.description}
                      </p>
                      {spell.higherLevel && (
                        <p className="text-xs text-purple-600 mt-2 italic">
                          <strong>升环施法：</strong>{spell.higherLevel}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">未选择戏法</p>
                </div>
              )}
            </div>
          )}

          {/* 一环法术列表 */}
          {activeTab === 'level1' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 mb-4">
                {spellInfo.isPrepared && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg flex-1">
                    <p className="text-sm text-blue-800">
                      <strong>准备法术：</strong>
                      你已准备 {selectedPreparedSpells.length}/{spellInfo.preparedCount} 个法术。
                      只有准备的法术才能施放。
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setShowAddSpellModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  添加法术
                </button>
              </div>

              {selectedFirstLevelSpells.length > 0 ? (
                selectedFirstLevelSpells.map((spellId: string) => {
                  const spell = getSpellById(spellId);
                  if (!spell) return null;

                  const isPrepared = selectedPreparedSpells.includes(spellId);

                  return (
                    <div
                      key={spellId}
                      className={`rounded-lg p-4 border-2 ${
                        isPrepared
                          ? 'bg-blue-100 border-blue-500 shadow-md'
                          : 'bg-white border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          {/* 法术名称 */}
                          <h3 className="font-bold text-blue-900 text-lg mb-1">
                            {spell.name} ({spell.nameEn})
                          </h3>
                          {/* 准备按钮 - 独立一行 */}
                          {spellInfo.isPrepared && (
                            <button
                              onClick={() => handleTogglePrepare(spellId)}
                              className={`px-3 py-1 rounded-full text-xs font-bold transition-all inline-block ${
                                isPrepared
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                              }`}
                            >
                              {isPrepared ? '已准备' : '准备'}
                            </button>
                          )}
                          {/* 法术信息 */}
                          <div className="text-sm text-blue-700 mt-2">
                            {spell.school} · 一环 · {spell.castingTime} · {spell.range}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                          <button
                            onClick={() => handleRemoveSpell(spellId)}
                            className="p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {spell.description}
                      </p>
                      {spell.higherLevel && (
                        <p className="text-xs text-blue-600 mt-2 italic">
                          <strong>升环施法：</strong>{spell.higherLevel}
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">未选择一环法术</p>
                </div>
              )}
            </div>
          )}

          {/* 二环法术列表（占位） */}
          {activeTab === 'level2' && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Zap className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">1级角色暂无二环法术</p>
              <p className="text-xs text-gray-400 mt-1">升级后可学习二环法术</p>
            </div>
          )}
        </div>
      </div>

      {/* 添加戏法弹窗 */}
      <AddSpellModal
        isOpen={showAddCantripModal}
        onClose={() => setShowAddCantripModal(false)}
        onComplete={handleAddCantrips}
        selectedClass={character.class}
        spellLevel={0}
        alreadySelected={selectedCantrips}
        title="添加戏法"
        description="选择要添加到角色卡的戏法"
      />

      {/* 添加一环法术弹窗 */}
      <AddSpellModal
        isOpen={showAddSpellModal}
        onClose={() => setShowAddSpellModal(false)}
        onComplete={handleAddSpells}
        selectedClass={character.class}
        spellLevel={1}
        alreadySelected={selectedFirstLevelSpells}
        title="添加一环法术"
        description="选择要添加到角色卡的一环法术"
      />
    </div>
  );
}
