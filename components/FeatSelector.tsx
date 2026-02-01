'use client';

import { useState } from 'react';
import { ORIGIN_FEATS, getVersatileOriginFeats, Feat, checkFeatPrerequisite } from '@/lib/feats-data';
import { Check, Search, Filter } from 'lucide-react';
import FeatDisplay from './FeatDisplay';

interface FeatSelectorProps {
  character: any; // 用于检查前置条件
  initialFeat?: string;
  onComplete: (featId: string) => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  /** 人类多才多艺：仅显示 2024 起源专长（约 10 个），否则显示全部 ORIGIN_FEATS */
  originOnlyVersatile?: boolean;
}

export default function FeatSelector({
  character,
  initialFeat,
  onComplete,
  onCancel,
  title = '选择专长',
  description = '从以下起源专长中选择一个',
  originOnlyVersatile = false,
}: FeatSelectorProps) {
  const [selectedFeat, setSelectedFeat] = useState<string | null>(initialFeat || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedFeat, setExpandedFeat] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selectedFeat) {
      onComplete(selectedFeat);
    }
  };

  const featList = originOnlyVersatile ? getVersatileOriginFeats() : ORIGIN_FEATS;

  // 获取所有类别（基于当前列表）
  const categories = Array.from(new Set(featList.map(f => f.category).filter(Boolean))) as string[];

  // 过滤专长
  const filteredFeats = featList.filter(feat => {
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
    <div className="space-y-3">
      {/* 标题和说明 - 紧凑 */}
      {(title || description) && (
        <div className="bg-purple-50 border-l-4 border-purple-500 px-3 py-2 rounded-r-lg">
          {title && <h3 className="font-bold text-purple-900 text-sm mb-0.5">{title}</h3>}
          {description && <p className="text-xs text-purple-800">{description}</p>}
        </div>
      )}

      {/* 搜索和过滤 - 紧凑 */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <label htmlFor="feat-search" className="sr-only">搜索专长</label>
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="feat-search"
            name="featSearch"
            type="text"
            placeholder="搜索专长名称或效果..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm"
            autoComplete="off"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            id="feat-filter-category"
            name="featFilterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-8 pr-3 py-1.5 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-sm appearance-none bg-white cursor-pointer min-w-[120px]"
          >
            <option value="all">所有类别</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 统计信息 - 紧凑 */}
      <div className="flex items-center justify-between text-xs text-gray-600 px-0.5">
        <span>显示 <strong className="text-purple-600">{filteredFeats.length}</strong> / {featList.length} 个</span>
        {selectedFeat && <span className="text-green-600 font-medium">✓ 已选 1 个</span>}
      </div>

      {/* 专长列表 - 紧凑 */}
      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
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
                    ? 'border-purple-500 bg-purple-50 shadow-sm'
                    : canSelect
                    ? 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                    : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm">{feat.name}</span>
                        <span className="text-xs text-gray-500">({feat.nameEn})</span>
                        {feat.category && (
                          <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded">{feat.category}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{feat.description}</p>
                      {feat.prerequisite && (
                        <div className="text-xs text-yellow-700 bg-yellow-50 px-1.5 py-0.5 rounded inline-block mt-1">前置：{feat.prerequisite}</div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  {(isSelected || expandedFeat === feat.id) && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="text-xs font-bold text-gray-700 mb-1">效果：</div>
                      <ul className="space-y-0.5">
                        {feat.benefits.map((benefit, index) => (
                          <li key={index} className="text-xs text-gray-600 pl-2.5 relative">
                            <span className="absolute left-0 text-purple-500">•</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                      {feat.repeatable && <div className="text-xs text-blue-600 mt-1 italic">⚡ 可重复选择</div>}
                    </div>
                  )}
                </div>
              </button>
            </div>
          );
        })}

        {filteredFeats.length === 0 && (
          <div className="text-center py-6 text-gray-500 text-sm">
            <Filter className="w-10 h-10 mx-auto mb-1 opacity-50" />
            <div>没有找到匹配的专长</div>
            <button
              onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}
              className="text-xs text-purple-600 hover:text-purple-800 underline mt-1"
            >
              清除筛选
            </button>
          </div>
        )}
      </div>

      {/* 底部：取消 / 确认选择 */}
      <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 flex-shrink-0">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 font-medium text-sm"
          >
            取消
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedFeat}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${
            selectedFeat
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          确认选择
        </button>
      </div>
    </div>
  );
}
