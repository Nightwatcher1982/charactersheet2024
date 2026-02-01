'use client';

import { useState } from 'react';
import { Character, CLASSES, BACKGROUNDS, SPECIES } from '@/lib/dnd-data';
import { getClassFeaturesByName } from '@/lib/class-features-data';
import { getFeatById } from '@/lib/feats-data';
import { Check } from 'lucide-react';

interface FeaturesPageProps {
  character: Partial<Character>;
  onUpdate: (updates: Partial<Character>) => void;
}

type FeatureTab = 'class' | 'species' | 'background';

export default function FeaturesPage({ character, onUpdate }: FeaturesPageProps) {
  const [activeTab, setActiveTab] = useState<FeatureTab>('class');

  const classData = CLASSES.find(c => c.name === character.class);
  const speciesData = SPECIES.find(s => s.name === character.species);
  const backgroundData = BACKGROUNDS.find(b => b.name === character.background);
  const classFeatures = classData ? getClassFeaturesByName(classData.name) : null;

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
                </h2>
                <p className="text-gray-600">{classData?.description}</p>
              </div>

              {classFeatures && classFeatures.level1Features.length > 0 ? (
                <div className="space-y-3">
                  {classFeatures.level1Features.map((feature, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200"
                    >
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-bold text-purple-900 text-lg mb-2">
                            {feature.name}
                          </h3>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {feature.description}
                          </p>
                          {feature.details && (
                            <ul className="mt-2 space-y-1 text-sm text-gray-600">
                              {feature.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-purple-600">•</span>
                                  <span>{detail}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无职业特性信息</p>
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

                {/* 专长 */}
                {(backgroundData?.featId || backgroundData?.feats) && (
                  <div className="bg-amber-50 rounded-lg p-4 border-2 border-amber-200 md:col-span-2">
                    <h3 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      起源专长
                    </h3>
                    {(() => {
                      const featId = backgroundData?.featId || (backgroundData?.feats && backgroundData.feats[0]);
                      const feat = featId ? getFeatById(featId) : null;
                      return feat ? (
                        <div>
                          <p className="font-semibold text-amber-900">{feat.name}</p>
                          <p className="text-gray-700 text-sm mt-1">{feat.description}</p>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-sm">{featId}</p>
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
