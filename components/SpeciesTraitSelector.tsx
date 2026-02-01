'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, Info, Sparkles } from 'lucide-react';

interface SpeciesChoice {
  id: string;
  name: string;
  options: string[];
}

interface SpeciesTraitSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  speciesName: string;
  choices: SpeciesChoice[];
  onComplete: (selections: Record<string, string>) => void;
  initialSelections?: Record<string, string>;
}

export default function SpeciesTraitSelector({
  isOpen,
  onClose,
  speciesName,
  choices,
  onComplete,
  initialSelections = {}
}: SpeciesTraitSelectorProps) {
  const [selections, setSelections] = useState<Record<string, string>>(initialSelections);

  useEffect(() => {
    if (isOpen) {
      // 禁用body滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复body滚动
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  // 清理函数 - 只在组件卸载时执行
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!isOpen) return null;

  const handleSelect = (choiceId: string, option: string) => {
    setSelections({ ...selections, [choiceId]: option });
  };

  const isComplete = choices.every(choice => selections[choice.id]);

  const handleConfirm = () => {
    if (isComplete) {
      onComplete(selections);
      onClose();
    }
  };

  if (!choices || choices.length === 0) {
    return null;
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
        {/* 标题栏 */}
        <div className="bg-leather-dark text-white p-4 flex items-center justify-between border-b-2 border-gold-dark flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold-light" />
            <h3 className="font-bold text-xl font-cinzel">
              {speciesName} - 物种特性选择
            </h3>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-leather-base rounded-full p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 说明信息 */}
        <div className="px-6 py-3 bg-blue-50 border-b-2 border-blue-100 flex-shrink-0">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              根据你的物种，需要做出以下选择。这将影响你的角色能力。
            </p>
          </div>
        </div>

        {/* 内容区 - 可滚动 */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-6">
            {choices.map((choice) => {
              const selected = selections[choice.id];

              return (
                <div key={choice.id}>
                  <h4 className="font-bold text-gray-900 mb-3 text-base font-cinzel">{choice.name}</h4>
                  <div className="space-y-3">
                    {choice.options.map((option, index) => {
                      const isSelected = selected === option;

                      return (
                        <button
                          key={index}
                          onClick={() => handleSelect(choice.id, option)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left bg-white ${
                            isSelected
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm text-gray-900">{option}</div>
                            </div>
                            {isSelected && (
                              <div className="ml-3 flex-shrink-0">
                                <Check className="w-5 h-5 text-purple-600" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="p-4 border-t-2 border-gray-200 bg-white flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors border border-gray-300"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isComplete}
            className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              isComplete
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Check className={`w-5 h-5 ${isComplete ? 'text-white' : 'text-gray-500'}`} />
            <span className={isComplete ? 'text-white' : 'text-gray-500'}>确认选择</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
}
