'use client';

import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface SkillSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  availableSkills: string[];
  requiredCount: number;
  onComplete: (skills: string[]) => void;
  initialSkills?: string[];
}

export default function SkillSelectorModal({
  isOpen,
  onClose,
  title,
  description,
  availableSkills,
  requiredCount,
  onComplete,
  initialSkills = []
}: SkillSelectorModalProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);

  useEffect(() => {
    if (isOpen) {
      setSelectedSkills(initialSkills);
    }
  }, [isOpen, initialSkills]);

  if (!isOpen) return null;

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      if (selectedSkills.length < requiredCount) {
        setSelectedSkills([...selectedSkills, skill]);
      }
    }
  };

  const isComplete = selectedSkills.length === requiredCount;
  const remaining = requiredCount - selectedSkills.length;

  const handleConfirm = () => {
    if (isComplete) {
      onComplete(selectedSkills);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
            <p className="text-sm text-blue-800">
              从以下技能中选择 <strong>{requiredCount}</strong> 项技能熟练
              {!isComplete && (
                <span className="ml-2">还需选择 <strong>{remaining}</strong> 项</span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {availableSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              const isDisabled = !isSelected && selectedSkills.length >= requiredCount;

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
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 mb-4">
              <div className="text-green-700 font-bold">✓ 技能选择完成！</div>
              <div className="text-green-600 text-sm mt-1">已选择：{selectedSkills.join('、')}</div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isComplete}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              isComplete
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
