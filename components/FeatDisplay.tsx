'use client';

import { useState } from 'react';
import { getFeatById, Feat } from '@/lib/feats-data';
import { ChevronDown, ChevronUp, Star, AlertCircle } from 'lucide-react';

interface FeatDisplayProps {
  featId: string;
  source?: string; // 专长来源（如"背景：士兵"）
  expanded?: boolean; // 是否默认展开
  showSource?: boolean; // 是否显示来源标签
}

export default function FeatDisplay({ 
  featId, 
  source, 
  expanded = false,
  showSource = true 
}: FeatDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const feat = getFeatById(featId);

  if (!feat) {
    return (
      <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-sm text-red-700">
        <AlertCircle className="w-4 h-4 inline mr-2" />
        未找到专长：{featId}
      </div>
    );
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case '战斗': return 'red';
      case '法术': return 'purple';
      case '技能': return 'blue';
      case '支援': return 'green';
      case '防御': return 'orange';
      case '运动': return 'teal';
      case '社交': return 'pink';
      default: return 'gray';
    }
  };

  const color = getCategoryColor(feat.category);

  return (
    <div className={`border-2 border-${color}-300 bg-${color}-50 rounded-lg overflow-hidden`}>
      {/* 标题栏 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between hover:bg-${color}-100 transition-colors`}
      >
        <div className="flex items-center gap-3 flex-1 text-left">
          <Star className={`w-5 h-5 text-${color}-600 flex-shrink-0`} />
          <div>
            <div className="font-bold text-gray-900">
              {feat.name}
              <span className="text-sm text-gray-500 ml-2">({feat.nameEn})</span>
            </div>
            {!isExpanded && (
              <div className="text-xs text-gray-600 mt-0.5">{feat.description}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {showSource && source && (
            <span className={`text-xs px-2 py-1 bg-${color}-200 text-${color}-800 rounded-full`}>
              {source}
            </span>
          )}
          {feat.category && (
            <span className={`text-xs px-2 py-1 bg-${color}-200 text-${color}-800 rounded-full`}>
              {feat.category}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* 展开内容 */}
      {isExpanded && (
        <div className={`px-4 pb-4 border-t-2 border-${color}-200 bg-white`}>
          <div className="text-sm text-gray-700 mt-3 mb-3">
            {feat.description}
          </div>

          {feat.prerequisite && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-3 text-xs">
              <strong className="text-yellow-800">前置条件：</strong>
              <span className="text-yellow-700 ml-1">{feat.prerequisite}</span>
            </div>
          )}

          {feat.repeatable && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-3 text-xs text-blue-700">
              ⚡ 此专长可以多次选择
            </div>
          )}

          <div>
            <div className="font-bold text-sm text-gray-800 mb-2">效果：</div>
            <ul className="space-y-1.5">
              {feat.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-gray-700 pl-4 relative">
                  <span className={`absolute left-0 top-1 text-${color}-500`}>•</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
