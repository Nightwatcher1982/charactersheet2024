'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Info } from 'lucide-react';

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
      // 禁用body滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复body滚动
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, initialSkills]);

  // 清理函数 - 只在组件卸载时执行
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
        {/* 头部 */}
        <div className="bg-leather-dark text-white p-4 flex items-center justify-between border-b-2 border-gold-dark flex-shrink-0">
          <div className="flex items-center gap-2 flex-1">
            <Check className="w-6 h-6 text-gold-light" />
            <div>
              <h2 className="text-xl font-bold font-cinzel">{title}</h2>
              <p className="text-sm text-white mt-0.5 opacity-95">{description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-leather-base rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 说明信息 - 与其他弹窗一致的样式 */}
        <div className="px-6 py-3 bg-blue-50 border-b-2 border-blue-100 flex-shrink-0">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="mb-2">
                请从下方技能列表中勾选所需数量的技能，作为你的职业技能熟练。熟练的技能在进行相关检定时可以加上熟练加值。
              </p>
              <p>
                {!isComplete && (
                  <span className="text-orange-600 font-semibold">
                    还需选择 <strong>{remaining}</strong> 项
                  </span>
                )}
                {isComplete && (
                  <span className="text-green-600 font-semibold">
                    ✓ 已完成选择
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* 内容区 - 可滚动 */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              const isDisabled = !isSelected && selectedSkills.length >= requiredCount;

              return (
                <button
                  key={skill}
                  onClick={() => !isDisabled && toggleSkill(skill)}
                  disabled={isDisabled}
                  className={`p-4 rounded-lg border-2 transition-all text-left bg-white ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">{skill}</span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 底部按钮 - 固定显示 */}
        <div className="p-4 border-t-2 border-gray-200 bg-white flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition border border-gray-300 font-semibold"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isComplete}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-colors ${
              isComplete
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            确认选择
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
