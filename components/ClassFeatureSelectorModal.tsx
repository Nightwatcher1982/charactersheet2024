'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Check, X, Info } from 'lucide-react';

interface FeatureOption {
  id: string;
  name: string;
  description: string;
}

interface ClassFeature {
  id: string;
  name: string;
  options: FeatureOption[];
}

interface ClassFeatureSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  feature: ClassFeature;
  onComplete: (featureId: string, optionId: string) => void;
  initialSelection?: string;
}

export default function ClassFeatureSelectorModal({
  isOpen,
  onClose,
  className,
  feature,
  onComplete,
  initialSelection
}: ClassFeatureSelectorModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(initialSelection || null);

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

  const handleConfirm = () => {
    if (selectedOption) {
      onComplete(feature.id, selectedOption);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
        {/* 标题栏 */}
        <div className="bg-leather-dark text-white p-4 flex items-center justify-between border-b-2 border-gold-dark flex-shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gold-light" />
            <h3 className="font-bold text-xl font-cinzel">
              {className} - {feature.name}
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
              选择一个特性选项。这将影响你的角色玩法风格。
            </p>
          </div>
        </div>

        {/* 内容区 - 可滚动 */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-3">
            {feature.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left bg-white ${
                  selectedOption === option.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-base mb-2 font-cinzel">
                      {option.name}
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                  
                  {selectedOption === option.id && (
                    <div className="flex-shrink-0">
                      <Check className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 底部按钮 - 固定显示 */}
        <div className="p-4 border-t-2 border-gray-200 bg-white flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors border border-gray-300"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedOption}
            className={`px-4 py-2.5 rounded-lg font-semibold transition-colors ${
              selectedOption
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
