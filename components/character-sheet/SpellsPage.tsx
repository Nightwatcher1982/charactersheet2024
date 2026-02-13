'use client';

import { useState, useMemo } from 'react';
import { Character, getAbilityModifier, getProficiencyBonus } from '@/lib/dnd-data';
import { getSpellById, getClassSpellInfo, getMagicInitiateSpellInfo, getEffectiveCantrips, getSpeciesGrantedCantrips, getMaxSpellLevelForClassAtLevel, type MagicInitiateEntry } from '@/lib/spells-data';
import { getFeatById } from '@/lib/feats-data';
import { Wand2, Sparkles, Zap, Trash2, AlertCircle, Plus, Pencil } from 'lucide-react';
import AddSpellModal from './AddSpellModal';
import MagicInitiateSpellModal from '@/components/MagicInitiateSpellModal';

interface SpellsPageProps {
  character: Partial<Character>;
  onUpdate: (updates: Partial<Character>) => void;
}

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

const SPELL_LEVEL_LABELS: Record<number, string> = {
  0: '戏法',
  1: '一环法术',
  2: '二环法术',
  3: '三环法术',
  4: '四环法术',
  5: '五环法术',
  6: '六环法术',
  7: '七环法术',
  8: '八环法术',
  9: '九环法术',
};

type SpellListTab = 'cantrips' | 'spells';

export default function SpellsPage({ character, onUpdate }: SpellsPageProps) {
  const [addModalLevel, setAddModalLevel] = useState<number | null>(null);
  const [spellTab, setSpellTab] = useState<SpellListTab>('cantrips');

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

  // 此处必为施法职业，供 TypeScript 收窄类型
  if (!spellInfo) return null;

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

  // 有效戏法 = 物种授予 + 职业选择
  const effectiveCantrips = getEffectiveCantrips(character);
  const speciesGrantedCantrips = getSpeciesGrantedCantrips(character);
  const selectedCantrips = character.classFeatureChoices?.selectedCantrips
    ? JSON.parse(character.classFeatureChoices.selectedCantrips as string)
    : [];
  
  const selectedFirstLevelSpells = character.classFeatureChoices?.selectedFirstLevelSpells
    ? JSON.parse(character.classFeatureChoices.selectedFirstLevelSpells as string)
    : [];

  const selectedPreparedSpells = character.classFeatureChoices?.selectedPreparedSpells
    ? JSON.parse(character.classFeatureChoices.selectedPreparedSpells as string)
    : [];

  // L1+ 已知法术：优先 character.spells（升级后），否则沿用创建时的 selectedFirstLevelSpells
  const allL1PlusSpells = (character.spells?.length ? character.spells : selectedFirstLevelSpells) as string[];
  const maxSpellLevel = getMaxSpellLevelForClassAtLevel(character.class, character.level || 1);
  const spellsByLevel = useMemo(() => {
    const byLevel: Record<number, string[]> = { 0: [...effectiveCantrips] };
    for (let L = 1; L <= 9; L++) {
      byLevel[L] = allL1PlusSpells.filter((id) => getSpellById(id)?.level === L);
    }
    return byLevel;
  }, [effectiveCantrips, allL1PlusSpells]);

  // 移除戏法（物种授予的戏法不可移除）
  const handleRemoveCantrip = (spellId: string) => {
    if (speciesGrantedCantrips.includes(spellId)) {
      return; // 物种特质戏法不显示移除按钮，或这里直接禁止
    }
    if (!confirm('确定要移除这个戏法吗？')) return;
    
    const updated = selectedCantrips.filter((id: string) => id !== spellId);
    const updatedChoices = {
      ...(character.classFeatureChoices || {}),
      selectedCantrips: JSON.stringify(updated)
    };
    onUpdate({ classFeatureChoices: updatedChoices });
  };

  // 移除法术（任意环位）
  const handleRemoveSpell = (spellId: string) => {
    if (!confirm('确定要移除这个法术吗？')) return;
    const updatedSpells = allL1PlusSpells.filter((id: string) => id !== spellId);
    const updatedPrepared = selectedPreparedSpells.filter((id: string) => id !== spellId);
    onUpdate({
      spells: updatedSpells,
      classFeatureChoices: {
        ...(character.classFeatureChoices || {}),
        selectedPreparedSpells: JSON.stringify(updatedPrepared),
        ...(updatedSpells.length === 0 ? {} : {}),
      },
    });
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

  // 添加戏法（与有效列表去重，避免重复添加物种戏法）
  const handleAddCantrips = (cantrips: string[]) => {
    const updatedCantrips = [...new Set([...selectedCantrips, ...cantrips])];
    onUpdate({
      classFeatureChoices: {
        ...(character.classFeatureChoices || {}),
        selectedCantrips: JSON.stringify(updatedCantrips),
      },
    });
    setAddModalLevel(null);
  };

  // 添加法术（任意环位 1–9）
  const handleAddSpells = (level: number, spellIds: string[]) => {
    if (level === 0) {
      handleAddCantrips(spellIds);
      return;
    }
    const updatedSpells = [...new Set([...allL1PlusSpells, ...spellIds])];
    onUpdate({ spells: updatedSpells });
    setAddModalLevel(null);
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
              {effectiveCantrips.length} / {spellInfo.cantripsKnown + speciesGrantedCantrips.length}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">已知法术</div>
            <div className="text-2xl font-bold text-blue-600">
              {allL1PlusSpells.length}
              {spellInfo.spellsKnown != null && ` / ${spellInfo.spellsKnown}`}
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

      {/* 戏法 / 法术 页签与列表 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light overflow-hidden">
        <div className="flex border-b-2 border-purple-200">
          <button
            type="button"
            onClick={() => setSpellTab('cantrips')}
            className={`flex-1 py-4 px-6 font-cinzel font-bold text-lg transition-colors flex items-center justify-center gap-2 ${spellTab === 'cantrips' ? 'bg-purple-600 text-white border-b-2 border-purple-600 -mb-0.5' : 'text-purple-700 hover:bg-purple-50'}`}
          >
            <Wand2 className="w-5 h-5" />
            戏法
          </button>
          <button
            type="button"
            onClick={() => setSpellTab('spells')}
            className={`flex-1 py-4 px-6 font-cinzel font-bold text-lg transition-colors flex items-center justify-center gap-2 ${spellTab === 'spells' ? 'bg-blue-600 text-white border-b-2 border-blue-600 -mb-0.5' : 'text-blue-700 hover:bg-blue-50'}`}
          >
            <Sparkles className="w-5 h-5" />
            法术
          </button>
        </div>
        <div className="p-6 space-y-8">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            .filter((L) => spellTab === 'cantrips' ? L === 0 : L >= 1 && L <= maxSpellLevel)
            .map((level) => {
              const ids = spellsByLevel[level] ?? [];
              const isCantrip = level === 0;
              const LevelIcon = isCantrip ? Wand2 : level === 1 ? Sparkles : Zap;
              return (
                <section key={level} className="border-b border-gray-200 last:border-b-0 last:pb-0 pb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${isCantrip ? 'text-purple-900' : level === 1 ? 'text-blue-900' : 'text-cyan-900'}`}>
                      <LevelIcon className={`w-5 h-5 ${isCantrip ? 'text-purple-600' : level === 1 ? 'text-blue-600' : 'text-cyan-600'}`} />
                      {SPELL_LEVEL_LABELS[level]} ({ids.length})
                    </h3>
                    {isCantrip && (
                      <button
                        type="button"
                        onClick={() => setAddModalLevel(0)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-bold text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        添加戏法
                      </button>
                    )}
                    {!isCantrip && level <= maxSpellLevel && (
                      <button
                        type="button"
                        onClick={() => setAddModalLevel(level)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        添加{level}环法术
                      </button>
                    )}
                  </div>
                  {level === 0 && (
                    <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded-r-lg mb-4">
                      <p className="text-sm text-purple-800">
                        <strong>戏法：</strong>可以无限施放，不需要准备。
                      </p>
                    </div>
                  )}
                  {level === 1 && spellInfo.isPrepared && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg mb-4">
                      <p className="text-sm text-blue-800">
                        <strong>准备法术：</strong>
                        你已准备 {selectedPreparedSpells.length}/{spellInfo.preparedCount} 个法术，只有准备的法术才能施放。
                      </p>
                    </div>
                  )}
                  {ids.length > 0 ? (
                    <ul className="space-y-3 list-none pl-0">
                      {ids.map((spellId: string) => {
                        const spell = getSpellById(spellId);
                        if (!spell) return null;
                        if (isCantrip) {
                          const isSpeciesGranted = speciesGrantedCantrips.includes(spellId);
                          return (
                            <li key={spellId} className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-bold text-purple-900 text-lg">
                                    {spell.name} ({spell.nameEn})
                                    {isSpeciesGranted && <span className="ml-2 text-xs font-normal text-purple-600">（物种）</span>}
                                  </h4>
                                  <div className="text-sm text-purple-700 mt-1">{spell.school} · {spell.castingTime} · {spell.range}</div>
                                </div>
                                <div className="flex items-center gap-2 ml-3">
                                  <Wand2 className="w-5 h-5 text-purple-600" />
                                  {!isSpeciesGranted && (
                                    <button type="button" onClick={() => handleRemoveCantrip(spellId)} className="p-1 hover:bg-red-100 rounded transition-colors">
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{spell.description}</p>
                              {spell.higherLevel && <p className="text-xs text-purple-600 mt-2 italic"><strong>升环施法：</strong>{spell.higherLevel}</p>}
                            </li>
                          );
                        }
                        const isPrepared = selectedPreparedSpells.includes(spellId);
                        return (
                          <li
                            key={spellId}
                            className={`rounded-lg p-4 border-2 ${isPrepared ? (level === 1 ? 'bg-blue-100 border-blue-500 shadow-md' : 'bg-cyan-100 border-cyan-500 shadow-md') : (level === 1 ? 'bg-white border-blue-200' : 'bg-white border-cyan-200')}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-blue-900 text-lg mb-1">{spell.name} ({spell.nameEn})</h4>
                                {spellInfo.isPrepared && (
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePrepare(spellId)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all inline-block ${isPrepared ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                                  >
                                    {isPrepared ? '已准备' : '准备'}
                                  </button>
                                )}
                                <div className="text-sm text-blue-700 mt-2">
                                  {spell.school} · {SPELL_LEVEL_LABELS[level]} · {spell.castingTime} · {spell.range}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-blue-600" />
                                <button type="button" onClick={() => handleRemoveSpell(spellId)} className="p-1 hover:bg-red-100 rounded transition-colors">
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{spell.description}</p>
                            {spell.higherLevel && <p className="text-xs text-blue-600 mt-2 italic"><strong>升环施法：</strong>{spell.higherLevel}</p>}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      {isCantrip ? <Wand2 className="w-10 h-10 text-gray-400 mx-auto mb-2" /> : <Sparkles className="w-10 h-10 text-gray-400 mx-auto mb-2" />}
                      <p className="text-gray-500">暂无{SPELL_LEVEL_LABELS[level]}</p>
                    </div>
                  )}
                </section>
              );
            })}
        </div>
      </div>

      {/* 添加法术弹窗（戏法或指定环位） */}
      <AddSpellModal
        isOpen={addModalLevel !== null}
        onClose={() => setAddModalLevel(null)}
        onComplete={(spellIds) => addModalLevel !== null && handleAddSpells(addModalLevel, spellIds)}
        selectedClass={character.class}
        spellLevel={(addModalLevel === null ? 0 : addModalLevel) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}
        alreadySelected={addModalLevel === 0 ? effectiveCantrips : (spellsByLevel[addModalLevel ?? 0] ?? [])}
        title={addModalLevel === 0 ? '添加戏法' : `添加${addModalLevel}环法术`}
        description={addModalLevel === 0 ? '选择要添加到角色卡的戏法' : `选择要添加到角色卡的${addModalLevel}环法术`}
      />
    </div>
  );
}
