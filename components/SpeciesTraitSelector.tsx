'use client';

import { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

interface SpeciesChoice {
  id: string;
  name: string;
  options: string[];
}

interface SpeciesTraitSelectorProps {
  speciesName: string;
  choices: SpeciesChoice[];
  onComplete: (selections: Record<string, string>) => void;
  initialSelections?: Record<string, string>;
}

export default function SpeciesTraitSelector({
  speciesName,
  choices,
  onComplete,
  initialSelections = {}
}: SpeciesTraitSelectorProps) {
  const [selections, setSelections] = useState<Record<string, string>>(initialSelections);
  const hasCalledRef = useRef(false);

  const isComplete = choices.every(choice => selections[choice.id]);

  useEffect(() => {
    if (isComplete && !hasCalledRef.current) {
      hasCalledRef.current = true;
      onComplete(selections);
    } else if (!isComplete) {
      hasCalledRef.current = false;
    }
  }, [selections, isComplete, onComplete]);

  useEffect(() => {
    // 如果没有需要选择的特性，立即完成
    if ((!choices || choices.length === 0) && !hasCalledRef.current) {
      hasCalledRef.current = true;
      onComplete({});
    }
  }, [choices, onComplete]);

  const handleSelect = (choiceId: string, option: string) => {
    setSelections({ ...selections, [choiceId]: option });
  };

  if (!choices || choices.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-teal-900 mb-2">
          {speciesName}物种特性选择
        </h3>
        <p className="text-sm text-teal-800">
          根据你的物种，需要做出以下选择
        </p>
      </div>

      {choices.map((choice) => {
        const selected = selections[choice.id];

        return (
          <div key={choice.id}>
            <h4 className="font-bold text-gray-900 mb-3">{choice.name}</h4>
            <div className="space-y-2">
              {choice.options.map((option, index) => {
                const isSelected = selected === option;

                return (
                  <button
                    key={index}
                    onClick={() => handleSelect(choice.id, option)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm text-gray-900">{option}</div>
                      </div>
                      {isSelected && (
                        <div className="ml-3">
                          <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
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

      {isComplete && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <div className="text-green-700 font-bold">✓ 物种特性选择完成！</div>
        </div>
      )}
    </div>
  );
}
