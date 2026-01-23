'use client';

import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

interface ClassFeature {
  id: string;
  name: string;
  description: string;
  benefits: string[];
}

interface ClassFeatureSelectorProps {
  featureName: string;
  options: ClassFeature[];
  onComplete: (selectedId: string) => void;
  initialSelection?: string;
}

export default function ClassFeatureSelector({ 
  featureName, 
  options, 
  onComplete, 
  initialSelection 
}: ClassFeatureSelectorProps) {
  const [selected, setSelected] = useState<string>(initialSelection || '');
  const hasCalledRef = useRef(false);

  useEffect(() => {
    // 如果有选择且未调用过回调，则调用
    if (selected && !hasCalledRef.current) {
      hasCalledRef.current = true;
      onComplete(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleSelect = (id: string) => {
    setSelected(id);
    hasCalledRef.current = false; // 允许重新选择
  };

  if (!options || options.length === 0) {
    return null;
  }

  const isComplete = selected !== '';

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-purple-900 mb-2">
          {featureName}
        </h3>
        <p className="text-sm text-purple-800">
          选择一个选项来定制你的职业能力
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = selected === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              className={`w-full p-5 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-bold text-gray-900">
                      {option.name}
                    </h4>
                    {isSelected && (
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{option.description}</p>
                  
                  {option.benefits && option.benefits.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">获得能力：</div>
                      <ul className="space-y-1">
                        {option.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-purple-500 mt-1">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isComplete && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <div className="text-green-700 font-bold">✓ 特性选择完成！</div>
          <div className="text-green-600 text-sm mt-1">
            已选择：{options.find(o => o.id === selected)?.name}
          </div>
        </div>
      )}
    </div>
  );
}
