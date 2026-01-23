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
    <div className="space-y-6">
      {/* 说明 */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-blue-900 mb-2">选择语言</h3>
        <p className="text-sm text-blue-800">
          你的角色自动知晓<strong>通用语</strong>。请再选择 <strong>{requiredCount}</strong> 种语言。
        </p>
        <p className="text-xs text-blue-700 mt-2">
          这些语言可以通过你的成长背景、旅行经历或学习获得。
        </p>
      </div>

      {/* 进度 */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <span className="text-sm text-gray-700">
          已选择：<strong className="text-blue-600">{selectedLanguages.length}</strong> / {requiredCount}
        </span>
        {!isComplete && (
          <button
            onClick={handleRollRandom}
            className="flex items-center gap-2 px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition-colors"
          >
            <Dice6 className="w-4 h-4" />
            随机选择
          </button>
        )}
      </div>

      {/* 已自动获得的语言 */}
      <div>
        <h4 className="font-bold text-gray-700 mb-2 text-sm">已知语言</h4>
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span className="font-medium">通用语 (Common)</span>
            <span className="text-xs text-gray-500 ml-auto">自动获得</span>
          </div>
          <p className="text-xs text-gray-600 mt-1 ml-6">
            起源于印记城，是多元宇宙中最广泛使用的语言
          </p>
        </div>
      </div>

      {/* 标准语言选择 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-gray-700 text-sm">标准语言</h4>
          <button
            onClick={() => setShowTable(!showTable)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            {showTable ? '隐藏' : '显示'}投骰表格
          </button>
        </div>

        {showTable && (
          <div className="bg-purple-50 border border-purple-300 rounded-lg p-3 mb-3 text-xs">
            <div className="font-bold text-purple-900 mb-2">投骰表格（1d12）</div>
            <div className="grid grid-cols-2 gap-1">
              {STANDARD_LANGUAGES_TABLE.filter(l => l.roll !== 0).map((entry, index) => (
                <div key={index} className="text-purple-800">
                  <span className="font-mono text-purple-600">
                    {Array.isArray(entry.roll) ? `${entry.roll[0]}-${entry.roll[1]}` : entry.roll}
                  </span>
                  {' '}→ {entry.name}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {STANDARD_LANGUAGES.filter(lang => lang.id !== 'common').map((language) => {
            const isSelected = selectedLanguages.includes(language.id);
            const canSelect = selectedLanguages.length < requiredCount || isSelected;

            return (
              <button
                key={language.id}
                onClick={() => toggleLanguage(language.id)}
                disabled={!canSelect && !isSelected}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : canSelect
                    ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-900">
                        {language.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({language.nameEn})
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      <strong>来源：</strong>{language.origin}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {language.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="ml-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
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

      {/* 稀有语言（如果允许） */}
      {showRareLanguages && (
        <div>
          <h4 className="font-bold text-gray-700 mb-3 text-sm">稀有语言</h4>
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-3 text-xs text-yellow-800">
            ⚠️ 稀有语言通常需要特殊的职业特性或背景才能学习
          </div>
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
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-yellow-500 bg-yellow-50'
                      : canSelect
                      ? 'border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
                      : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-gray-900">
                          {language.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({language.nameEn})
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <strong>来源：</strong>{language.origin}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {language.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="ml-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
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
      )}

      {/* 完成提示 */}
      {isComplete && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <div className="text-green-700 font-bold">✓ 语言选择完成！</div>
          <div className="text-green-600 text-sm mt-1">
            你现在知晓 {selectedLanguages.length + 1} 种语言
          </div>
        </div>
      )}

      {/* 帮助信息 */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-xs text-gray-700">
        <div className="font-bold mb-2">💡 语言说明</div>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>通用语</strong>：所有角色自动知晓，用于与大多数智慧生物交流</li>
          <li><strong>标准语言</strong>：在物质位面广泛使用，适合大多数冒险</li>
          <li><strong>稀有语言</strong>：需要特殊机缘或职业特性才能学习</li>
          <li>知晓一种语言意味着你可以说、读、写该语言</li>
          <li>某些职业或专长可能提供额外语言</li>
        </ul>
      </div>
    </div>
  );
}
