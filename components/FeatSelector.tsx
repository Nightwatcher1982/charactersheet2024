'use client';

import { useState, useEffect } from 'react';
import { ORIGIN_FEATS, Feat, checkFeatPrerequisite } from '@/lib/feats-data';
import { Check, Search, Filter } from 'lucide-react';
import FeatDisplay from './FeatDisplay';

interface FeatSelectorProps {
  character: any; // 用于检查前置条件
  initialFeat?: string;
  onComplete: (featId: string) => void;
  title?: string;
  description?: string;
}

export default function FeatSelector({
  character,
  initialFeat,
  onComplete,
  title = '选择专长',
  description = '从以下起源专长中选择一个'
}: FeatSelectorProps) {
  const [selectedFeat, setSelectedFeat] = useState<string | null>(initialFeat || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedFeat, setExpandedFeat] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFeat) {
      onComplete(selectedFeat);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeat]); // 移除 onComplete 避免无限循环

  // 获取所有类别
  const categories = Array.from(new Set(ORIGIN_FEATS.map(f => f.category).filter(Boolean))) as string[];

  // 过滤专长
  const filteredFeats = ORIGIN_FEATS.filter(feat => {
    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!feat.name.toLowerCase().includes(term) && 
          !feat.nameEn.toLowerCase().includes(term) &&
          !feat.description.toLowerCase().includes(term)) {
        return false;
      }
    }

    // 类别过滤
    if (filterCategory !== 'all' && feat.category !== filterCategory) {
      return false;
    }

    return true;
  });

  const handleSelectFeat = (featId: string) => {
    setSelectedFeat(featId);
    setExpandedFeat(featId);
  };

  return (
    <div className="space-y-4">
      {/* 标题和说明 */}
      <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
        <h3 className="font-bold text-purple-900 mb-2">{title}</h3>
        <p className="text-sm text-purple-800">{description}</p>
      </div>

      {/* 搜索和过滤 */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* 搜索框 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索专长名称或效果..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
          />
        </div>

        {/* 类别过滤 */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm appearance-none bg-white cursor-pointer"
          >
            <option value="all">所有类别</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center justify-between text-sm text-gray-600 px-1">
        <span>
          显示 <strong className="text-purple-600">{filteredFeats.length}</strong> / {ORIGIN_FEATS.length} 个专长
        </span>
        {selectedFeat && (
          <span className="text-green-600 font-medium">
            ✓ 已选择 1 个专长
          </span>
        )}
      </div>

      {/* 专长列表 */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredFeats.map((feat) => {
          const isSelected = selectedFeat === feat.id;
          const canSelect = checkFeatPrerequisite(feat, character);

          return (
            <div key={feat.id} className="relative">
              <button
                onClick={() => handleSelectFeat(feat.id)}
                disabled={!canSelect}
                className={`w-full text-left rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 shadow-md'
                    : canSelect
                    ? 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{feat.name}</span>
                        <span className="text-xs text-gray-500">({feat.nameEn})</span>
                        {feat.category && (
                          <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full">
                            {feat.category}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {feat.description}
                      </div>
                      {feat.prerequisite && (
                        <div className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded inline-block">
                          前置：{feat.prerequisite}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="ml-3">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 展开查看详情 */}
                  {(isSelected || expandedFeat === feat.id) && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-xs font-bold text-gray-700 mb-1.5">效果：</div>
                      <ul className="space-y-1">
                        {feat.benefits.map((benefit, index) => (
                          <li key={index} className="text-xs text-gray-600 pl-3 relative">
                            <span className="absolute left-0 text-purple-500">•</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      {feat.repeatable && (
                        <div className="text-xs text-blue-600 mt-2 italic">
                          ⚡ 此专长可以重复选择
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}

        {filteredFeats.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Filter className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <div>没有找到匹配的专长</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('all');
              }}
              className="text-sm text-purple-600 hover:text-purple-800 underline mt-2"
            >
              清除筛选条件
            </button>
          </div>
        )}
      </div>

      {/* 完成提示 */}
      {selectedFeat && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4 text-center">
          <div className="text-green-700 font-bold">✓ 专长选择完成！</div>
          <div className="text-green-600 text-sm mt-1">
            你选择了：{ORIGIN_FEATS.find(f => f.id === selectedFeat)?.name}
          </div>
        </div>
      )}

      {/* 帮助信息 */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-xs text-gray-700">
        <div className="font-bold mb-2">💡 关于专长</div>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>起源专长</strong>：在1级通过背景或人类特质获得</li>
          <li>某些专长有前置条件（如最低属性要求）</li>
          <li>某些专长可以重复选择（在满足条件时）</li>
          <li>专长提供的能力立即生效</li>
          <li>在4级、8级等特定等级可以获得额外专长</li>
        </ul>
      </div>
    </div>
  );
}
