'use client';

import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { CLASSES } from '@/lib/dnd-data';

interface ClassSkillSelectorProps {
  selectedClass: string;
  onComplete: (skills: string[]) => void;
  initialSkills?: string[];
}

export default function ClassSkillSelector({ selectedClass, onComplete, initialSkills = [] }: ClassSkillSelectorProps) {
  const classData = CLASSES.find(c => c.name === selectedClass);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);
  const lastCompletedRef = useRef<string>('');

  useEffect(() => {
    // 当技能选择完成时，自动调用回调
    if (classData && selectedSkills.length === classData.skillChoices) {
      const skillsKey = selectedSkills.sort().join(',');
      // 只在技能组合改变时调用
      if (lastCompletedRef.current !== skillsKey) {
        lastCompletedRef.current = skillsKey;
        onComplete(selectedSkills);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkills, classData]);

  if (!classData || !classData.availableSkills || !classData.skillChoices) {
    return (
      <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
        <p className="text-red-800">错误：无法加载职业数据</p>
      </div>
    );
  }

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      if (selectedSkills.length < classData.skillChoices) {
        setSelectedSkills([...selectedSkills, skill]);
      }
    }
  };

  const isComplete = selectedSkills.length === classData.skillChoices;
  const remaining = classData.skillChoices - selectedSkills.length;

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-blue-900 mb-2">
          {classData.name}职业技能选择
        </h3>
        <p className="text-sm text-blue-800">
          从以下技能中选择 <strong>{classData.skillChoices}</strong> 项技能熟练
        </p>
        {!isComplete && (
          <p className="text-sm text-blue-700 mt-1">
            还需选择 <strong>{remaining}</strong> 项技能
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {classData.availableSkills.map((skill) => {
          const isSelected = selectedSkills.includes(skill);
          const isDisabled = !isSelected && selectedSkills.length >= classData.skillChoices;

          return (
            <button
              key={skill}
              onClick={() => !isDisabled && toggleSkill(skill)}
              disabled={isDisabled}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-green-500 bg-green-50'
                  : isDisabled
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{skill}</span>
                {isSelected && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {isComplete && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <div className="text-green-700 font-bold">✓ 技能选择完成！</div>
          <div className="text-green-600 text-sm mt-1">已选择：{selectedSkills.join('、')}</div>
        </div>
      )}
    </div>
  );
}
