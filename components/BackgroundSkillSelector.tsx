'use client';

import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { BACKGROUNDS } from '@/lib/dnd-data';
import BackgroundAbilityBonus from './BackgroundAbilityBonus';

interface BackgroundSkillSelectorProps {
  selectedBackground: string;
  onSkillsComplete: (skills: string[]) => void;
  onAbilityComplete: (bonuses: Record<string, number>) => void;
  initialSkills?: string[];
  initialBonuses?: Record<string, number>;
}

export default function BackgroundSkillSelector({ 
  selectedBackground, 
  onSkillsComplete, 
  onAbilityComplete,
  initialSkills = [],
  initialBonuses = {}
}: BackgroundSkillSelectorProps) {
  const backgroundData = BACKGROUNDS.find(b => b.name === selectedBackground);
  const [showAbilityBonus, setShowAbilityBonus] = useState(false);
  const hasCalledSkillsRef = useRef(false);

  useEffect(() => {
    // 背景的技能是固定的，直接完成（只调用一次）
    if (backgroundData && backgroundData.skills && !hasCalledSkillsRef.current) {
      hasCalledSkillsRef.current = true;
      onSkillsComplete(backgroundData.skills);
      // 自动显示属性加值选择
      setShowAbilityBonus(true);
    }
  }, [backgroundData, onSkillsComplete]);

  if (!backgroundData || !backgroundData.skills) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
        <p className="text-red-800">错误：无法加载背景数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-blue-900 mb-2">
          {backgroundData.name}背景技能
        </h3>
        <p className="text-sm text-blue-800">
          此背景自动获得以下技能熟练
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {backgroundData.skills.map((skill) => (
          <div
            key={skill}
            className="p-4 rounded-lg border-2 border-green-500 bg-green-50"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{skill}</span>
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">其他收益</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>工具熟练：</strong>{backgroundData.toolProficiency}</li>
          <li>• <strong>属性加值：</strong>+3（可分配到1-3个属性）</li>
          <li>• <strong>起源专长：</strong>{backgroundData.featId}</li>
          <li>• <strong>初始装备：</strong>可选装备包或金币</li>
        </ul>
      </div>

      {!showAbilityBonus ? (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <div className="text-green-700 font-bold">✓ 技能设置完成！</div>
          <div className="text-green-600 text-sm mt-1">已获得技能：{backgroundData.skills.join('、')}</div>
        </div>
      ) : (
        <>
          <div className="border-t-2 border-gray-200 my-6"></div>
          
          <BackgroundAbilityBonus
            availableAbilities={backgroundData.abilityChoices || []}
            onComplete={onAbilityComplete}
            initialBonuses={initialBonuses}
          />
        </>
      )}
    </div>
  );
}
