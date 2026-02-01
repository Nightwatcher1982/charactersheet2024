'use client';

import { useState, useEffect } from 'react';
import { STANDARD_LANGUAGES, RARE_LANGUAGES, getLanguageById, STANDARD_LANGUAGES_TABLE, rollRandomLanguage } from '@/lib/languages-data';
import { Check, Dice6 } from 'lucide-react';

interface LanguageSelectorProps {
  initialLanguages?: string[]; // 已选语言（包含common）
  requiredCount: number; // 需要选择的数量（通常是2）
  onComplete: (languages: string[]) => void;
  showRareLanguages?: boolean; // 是否显示稀有语言
}

export default function LanguageSelector({
  initialLanguages = ['common'],
  requiredCount = 2,
  onComplete,
  showRareLanguages = false
}: LanguageSelectorProps) {
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(
    initialLanguages.filter(lang => lang !== 'common') // 不包含通用语
  );
  const [showTable, setShowTable] = useState(false);

  const isComplete = selectedLanguages.length === requiredCount;

  useEffect(() => {
    if (isComplete) {
      onComplete(['common', ...selectedLanguages]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguages, isComplete]); // 移除 onComplete 避免无限循环

  const toggleLanguage = (languageId: string) => {
    if (languageId === 'common') return; // 通用语不能取消

    if (selectedLanguages.includes(languageId)) {
      setSelectedLanguages(selectedLanguages.filter(id => id !== languageId));
    } else {
      if (selectedLanguages.length < requiredCount) {
        setSelectedLanguages([...selectedLanguages, languageId]);
      } else {
        // 替换最后一个
        const newSelection = [...selectedLanguages];
        newSelection[newSelection.length - 1] = languageId;
        setSelectedLanguages(newSelection);
      }
    }
  };

  const handleRollRandom = () => {
    const availableLanguages = STANDARD_LANGUAGES.filter(
      lang => lang.id !== 'common' && !selectedLanguages.includes(lang.id)
    );
    
    if (availableLanguages.length === 0) return;
    
    const randomLang = availableLanguages[Math.floor(Math.random() * availableLanguages.length)];
    toggleLanguage(randomLang.id);
  };

  return (
    <div className="space-y-4">
      {/* 进度 */}
      <div className="flex items-center justify-between bg-amber-50/70 p-3 rounded-lg border border-gold-light/50">
        <span className="text-sm text-leather-dark font-medieval">
          已选择：<strong className="text-purple-700">{selectedLanguages.length}</strong> / {requiredCount}
        </span>
        {!isComplete && (
          <button
            onClick={handleRollRandom}
            className="flex items-center gap-2 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
          >
            <Dice6 className="w-4 h-4" />
            随机
          </button>
        )}
      </div>

      {/* 标准语言选择 */}
      <div className="space-y-2">
        {STANDARD_LANGUAGES.filter(lang => lang.id !== 'common').map((language) => {
          const isSelected = selectedLanguages.includes(language.id);
          const canSelect = selectedLanguages.length < requiredCount || isSelected;

          return (
            <button
              key={language.id}
              onClick={() => toggleLanguage(language.id)}
              disabled={!canSelect && !isSelected}
              className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 shadow-md'
                  : canSelect
                  ? 'border-gold-dark/30 bg-white/90 hover:border-purple-500 hover:shadow-md'
                  : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-leather-dark font-cinzel">
                      {language.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({language.nameEn})
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div className="ml-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 稀有语言（如果允许） */}
      {showRareLanguages && (
        <div>
          <h4 className="font-bold text-leather-dark mb-2 text-sm font-cinzel">稀有语言</h4>
          <div className="space-y-2">
            {RARE_LANGUAGES.filter(lang => 
              // 过滤掉只能通过职业获得的语言
              lang.id !== 'druidic' && lang.id !== 'thieves-cant'
            ).map((language) => {
              const isSelected = selectedLanguages.includes(language.id);
              const canSelect = selectedLanguages.length < requiredCount || isSelected;

              return (
                <button
                  key={language.id}
                  onClick={() => toggleLanguage(language.id)}
                  disabled={!canSelect && !isSelected}
                  className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-yellow-600 bg-gradient-to-br from-yellow-50 to-amber-50 shadow-md'
                      : canSelect
                      ? 'border-gold-dark/30 bg-white/90 hover:border-yellow-500 hover:shadow-md'
                      : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-leather-dark font-cinzel">
                          {language.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({language.nameEn})
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="ml-3">
                        <div className="w-6 h-6 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
