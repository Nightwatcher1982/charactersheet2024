'use client';

import { useState, useMemo } from 'react';
import { Character, CLASSES, BACKGROUNDS, SPECIES } from '@/lib/dnd-data';
import { getClassFeaturesByName, getClassFeatureDetailByLevel, type ClassFeatureDetail } from '@/lib/class-features-data';
import { getLevelEntryByClassName, getClassIdFromName } from '@/lib/class-level-table';
import { getSubclassById } from '@/lib/subclass-data';
import { getSubclassFeaturesByLevel, type SubclassFeatureDetail } from '@/lib/subclass-features-data';
import { getFeatById } from '@/lib/feats-data';
import { getSpellById } from '@/lib/spells-data';
import { Check } from 'lucide-react';

interface FeaturesPageProps {
  character: Partial<Character>;
  onUpdate: (updates: Partial<Character>) => void;
}

type FeatureTab = 'class' | 'species' | 'background';

/** 按等级汇总已获得的职业特性与选项（用于展示） */
function useClassFeaturesByLevel(className: string, characterLevel: number) {
  return useMemo(() => {
    const entries: { level: number; features: { id: string; name: string }[]; choices: { id: string; name: string }[] }[] = [];
    for (let lv = 1; lv <= characterLevel; lv++) {
      const entry = getLevelEntryByClassName(className, lv);
      if (!entry) continue;
      entries.push({
        level: lv,
        features: entry.features ?? [],
        choices: entry.choices?.map((c) => ({ id: c.id, name: c.name })) ?? [],
      });
    }
    return entries;
  }, [className, characterLevel]);
}

export default function FeaturesPage({ character, onUpdate }: FeaturesPageProps) {
  const [activeTab, setActiveTab] = useState<FeatureTab>('class');

  const classData = CLASSES.find(c => c.name === character.class);
  const speciesData = SPECIES.find(s => s.name === character.species);
  const backgroundData = BACKGROUNDS.find(b => b.name === character.background);
  const classFeatures = classData ? getClassFeaturesByName(classData.name) : null;
  const characterLevel = typeof character.level === 'number' ? character.level : 1;
  const levelEntries = useClassFeaturesByLevel(character.class ?? '', characterLevel);
  const subclassId = character?.subclass ?? (character?.classFeatureChoices as { subclass?: string } | undefined)?.subclass;
  const classId = character?.class ? getClassIdFromName(character.class) : null;
  const subclass = classId && subclassId ? getSubclassById(classId, subclassId) : null;

  const findFeatureDetail = (featureId: string, level: number): ClassFeatureDetail | undefined =>
    getClassFeatureDetailByLevel(character.class ?? '', level, featureId);

  /** 渲染一条子职特性（含逸闻附赠熟练的已选技能、魔法探秘的已选法术） */
  const renderSubclassFeatureCard = (
    sub: SubclassFeatureDetail,
    level: number,
    key: string
  ) => {
    const choices = character?.classFeatureChoices as Record<string, string> | undefined;
    const loreSkills: string[] = (() => {
      try { return choices?.loreExtraSkills ? JSON.parse(choices.loreExtraSkills) : []; } catch { return []; }
    })();
    const loreSpellIds: string[] = (() => {
      try { return choices?.loreMagicalSecrets ? JSON.parse(choices.loreMagicalSecrets) : []; } catch { return []; }
    })();
    const showLoreSkills = sub.name === '附赠熟练' && loreSkills.length > 0;
    const showLoreSpells = sub.name === '魔法探秘' && loreSpellIds.length > 0;
    return (
      <div key={key} className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-purple-900 text-lg">{sub.name}</h3>
            {sub.nameEn && <p className="text-xs text-purple-600 mb-2">{sub.nameEn}</p>}
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{sub.description}</p>
            {sub.details && sub.details.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {sub.details.map((d, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            )}
            {showLoreSkills && <p className="mt-2 text-sm text-purple-700">已选技能：{loreSkills.join('、')}</p>}
            {showLoreSpells && (
              <p className="mt-2 text-sm text-purple-700">
                已选法术：{loreSpellIds.map((id) => getSpellById(id)?.name ?? id).join('、')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页签导航 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light overflow-hidden">
        <div className="flex border-b-2 border-gold-light">
          <button
            onClick={() => setActiveTab('class')}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === 'class'
                ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            职业特性
          </button>
          <button
            onClick={() => setActiveTab('species')}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === 'species'
                ? 'bg-green-50 text-green-700 border-b-4 border-green-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            物种特性
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`flex-1 px-6 py-4 font-bold transition-all ${
              activeTab === 'background'
                ? 'bg-amber-50 text-amber-700 border-b-4 border-amber-600'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            背景信息
          </button>
        </div>

        <div className="p-6">
          {/* 职业特性 */}
          {activeTab === 'class' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-cinzel font-bold text-purple-900">
                  {character.class}
                  {subclass && <span className="text-purple-700 font-normal"> · {subclass.name}</span>}
                </h2>
                <p className="text-gray-600">{classData?.description}</p>
              </div>

              {/* 按等级列出的职业特性 */}
              {levelEntries.length > 0 ? (
                <div className="space-y-4">
                  {levelEntries.map(({ level, features, choices }) => (
                    <div key={level} className="space-y-2">
                      <h3 className="text-sm font-bold text-purple-700 border-b border-purple-200 pb-1">
                        {level} 级
                      </h3>
                      <div className="space-y-2 pl-2">
                        {features.map((f) => {
                          if (f.id === 'subclass-feature' && classId && subclassId) {
                            const subFeatures = getSubclassFeaturesByLevel(classId, subclassId, level);
                            if (subFeatures.length > 0) {
                              return subFeatures.map((sub, idx) =>
                                renderSubclassFeatureCard(sub, level, `subclass-${level}-${idx}-${sub.name}`)
                              );
                            }
                            return (
                              <div key={f.id} className="flex items-center gap-2 py-2 text-gray-700">
                                <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                                <span className="font-medium">{f.name}</span>
                                <p className="text-sm text-gray-600">详见《2024 核心规则》对应子职业说明。</p>
                              </div>
                            );
                          }
                          const detail = findFeatureDetail(f.id, level);
                          if (detail) {
                            return (
                              <div
                                key={f.id}
                                className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200"
                              >
                                <div className="flex items-start gap-3">
                                  <Check className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                                  <div className="flex-1">
                                    <h3 className="font-bold text-purple-900 text-lg">{detail.name}</h3>
                                    {detail.nameEn && <p className="text-xs text-purple-600 mb-2">{detail.nameEn}</p>}
                                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                      {detail.description}
                                    </p>
                                    {detail.details && (
                                      <ul className="mt-2 space-y-1 text-sm text-gray-600">
                                        {detail.details.map((d, idx) => (
                                          <li key={idx} className="flex items-start gap-2">
                                            <span className="text-purple-600">•</span>
                                            <span>{d}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                    {(f.id === 'expertise' || f.id === 'expertise-2') && (() => {
                                      const raw = (character.classFeatureChoices as Record<string, string> | undefined)?.expertiseSkills;
                                      try {
                                        const arr: string[] = raw ? JSON.parse(raw) : [];
                                        if (arr.length > 0) return <p className="mt-2 text-sm text-purple-700">已选专精技能：{arr.join('、')}</p>;
                                      } catch { return null; }
                                      return null;
                                    })()}
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <div
                              key={f.id}
                              className="flex items-center gap-2 py-2 text-gray-700"
                            >
                              <Check className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              <span className="font-medium">{f.name}</span>
                            </div>
                          );
                        })}
                        {choices.map((c) => {
                          const choiceDesc = c.id === 'ability-score-improvement' || c.id === 'epic-boon'
                            ? '你获得属性值提升专长（见第五章）或其他你满足条件的专长。'
                            : null;
                          return (
                            <div key={c.id} className={choiceDesc ? 'bg-purple-50 rounded-lg p-4 border-2 border-purple-200' : 'flex items-center gap-2 py-2 text-gray-600'}>
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                <span className="font-medium text-purple-900">{c.name}</span>
                                {c.id === 'subclass' && subclass && (
                                  <span className="text-purple-700 font-medium">（已选：{subclass.name}）</span>
                                )}
                              </div>
                              {choiceDesc && <p className="text-sm text-gray-700 mt-2 pl-6">{choiceDesc}</p>}
                            </div>
                          );
                        })}
                        {choices.some((c) => c.id === 'subclass') && classId && subclassId && (() => {
                          const subFeatures = getSubclassFeaturesByLevel(classId, subclassId, level);
                          if (subFeatures.length === 0) return null;
                          return subFeatures.map((sub, idx) =>
                            renderSubclassFeatureCard(sub, level, `subclass-choice-${level}-${idx}-${sub.name}`)
                          );
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无职业特性信息</p>
                </div>
              )}

              {/* 子职业区块：有子职业时展示 */}
              {subclass && (
                <div className="mt-6 pt-6 border-t-2 border-purple-200">
                  <h3 className="text-xl font-cinzel font-bold text-purple-800 mb-2">
                    子职业：{subclass.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{subclass.nameEn}</p>
                  <p className="text-sm text-gray-600">
                    子职特性在 3 级选择子职业后获得，并在 6、10、14 级等获得进阶子职特性，详见《2024 核心规则》对应子职业说明。
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 物种特性 */}
          {activeTab === 'species' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-cinzel font-bold text-green-900">
                  {character.species}
                </h2>
                <p className="text-gray-600">{speciesData?.description}</p>
              </div>

              {speciesData && speciesData.traits.length > 0 ? (
                <div className="space-y-3">
                  {speciesData.traits.map((trait, index) => (
                    <div
                      key={index}
                      className="bg-green-50 rounded-lg p-4 border-2 border-green-200"
                    >
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-green-900 text-lg mb-2">
                            {trait.name}
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {trait.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无物种特性信息</p>
                </div>
              )}
            </div>
          )}

          {/* 背景信息 */}
          {activeTab === 'background' && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-2xl font-cinzel font-bold text-amber-900">
                  {character.background}
                </h2>
                <p className="text-gray-600">{backgroundData?.narrative}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 技能 */}
                {backgroundData?.skills && backgroundData.skills.length > 0 && (
                  <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
                    <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      技能熟练
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {backgroundData.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 工具熟练 */}
                {backgroundData?.toolProficiency && (
                  <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200">
                    <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      工具熟练
                    </h3>
                    <p className="text-gray-700 text-sm">{backgroundData.toolProficiency}</p>
                  </div>
                )}

                {/* 起源专长：完整规则详情 */}
                {(backgroundData?.featId || backgroundData?.feats) && (
                  <div className="bg-amber-50 rounded-lg p-5 border-2 border-amber-200 md:col-span-2">
                    <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      起源专长
                    </h3>
                    {(() => {
                      const featId = backgroundData?.featId || (backgroundData?.feats && backgroundData.feats[0]);
                      const feat = featId ? getFeatById(featId) : null;
                      if (!feat) {
                        return <p className="text-gray-600 text-sm">{featId}</p>;
                      }
                      return (
                        <div className="space-y-3">
                          <div>
                            <p className="font-bold text-amber-900 text-lg">{feat.name}</p>
                            {feat.nameEn && (
                              <p className="text-amber-800/80 text-sm">{feat.nameEn}</p>
                            )}
                            {feat.category && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded text-xs font-medium">
                                {feat.category}
                              </span>
                            )}
                            {feat.repeatable && (
                              <span className="ml-2 inline-block px-2 py-0.5 bg-amber-200/60 text-amber-800 rounded text-xs">
                                可复选
                              </span>
                            )}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {feat.description}
                          </p>
                          {feat.prerequisite && (
                            <div className="text-sm">
                              <span className="font-semibold text-amber-900">先决条件：</span>
                              <span className="text-gray-700">{feat.prerequisite}</span>
                            </div>
                          )}
                          {feat.benefits && feat.benefits.length > 0 && (
                            <div>
                              <p className="font-semibold text-amber-900 mb-2 text-sm">规则详情：</p>
                              <ul className="space-y-1.5 text-sm text-gray-700">
                                {feat.benefits.map((benefit, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-amber-600 mt-0.5 flex-shrink-0">•</span>
                                    <span className="leading-relaxed">{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 属性加值 */}
                {character.backgroundAbilityBonuses && (
                  <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200 md:col-span-2">
                    <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      属性加值
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(character.backgroundAbilityBonuses).map(([ability, bonus]) => (
                        <span
                          key={ability}
                          className="px-3 py-1 bg-amber-200 text-amber-900 rounded-full text-sm font-semibold"
                        >
                          {ability} +{bonus}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
