'use client';

import { useState, useEffect } from 'react';
import { X, Check, Search } from 'lucide-react';

export interface SelectorItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  tags?: string[];
  [key: string]: unknown; // 允许额外的自定义字段
}

interface UnifiedSelectorProps<T extends SelectorItem> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  items: T[];
  selectedItems: string[]; // 选中项的ID数组
  onConfirm: (selectedIds: string[]) => void;
  
  // 可选配置
  minSelect?: number; // 最少选择数量
  maxSelect?: number; // 最多选择数量
  searchable?: boolean; // 是否可搜索
  categorizable?: boolean; // 是否按分类显示
  multiSelect?: boolean; // 是否允许多选（默认true）
  showDescription?: boolean; // 是否显示描述（默认true）
  
  // 自定义渲染
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode;
  filterItem?: (item: T, searchTerm: string) => boolean; // 自定义搜索过滤
}

export default function UnifiedSelector<T extends SelectorItem>({
  isOpen,
  onClose,
  title,
  description,
  items,
  selectedItems: initialSelectedItems,
  onConfirm,
  minSelect = 0,
  maxSelect,
  searchable = true,
  categorizable = false,
  multiSelect = true,
  showDescription = true,
  renderItem,
  filterItem,
}: UnifiedSelectorProps<T>) {
  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelectedItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      setSelectedItems(initialSelectedItems);
      setSearchTerm('');
      setSelectedCategory('all');
      // 禁用body滚动
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复body滚动
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, initialSelectedItems]);
  
  // 清理函数 - 只在组件卸载时执行
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!isOpen) return null;

  const toggleItem = (itemId: string) => {
    if (!multiSelect) {
      setSelectedItems([itemId]);
      return;
    }

    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      if (!maxSelect || selectedItems.length < maxSelect) {
        setSelectedItems([...selectedItems, itemId]);
      }
    }
  };

  // 过滤和搜索
  const filteredItems = items.filter(item => {
    // 分类过滤
    if (categorizable && selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // 搜索过滤
    if (searchTerm) {
      if (filterItem) {
        return filterItem(item, searchTerm);
      }
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        item.tags?.some(tag => tag.toLowerCase().includes(term))
      );
    }

    return true;
  });

  // 获取所有分类
  const categories = categorizable
    ? Array.from(new Set(items.map(item => item.category).filter(Boolean))) as string[]
    : [];

  const isComplete = 
    selectedItems.length >= minSelect &&
    (!maxSelect || selectedItems.length <= maxSelect);
  
  const remaining = maxSelect ? maxSelect - selectedItems.length : 0;

  const handleConfirm = () => {
    if (isComplete) {
      onConfirm(selectedItems);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
        {/* 头部 */}
        <div className="border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索和过滤 */}
        <div className="border-b border-gray-200 p-4 space-y-3 flex-shrink-0">
          {/* 选择提示 */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg">
            <p className="text-sm text-blue-800">
              {minSelect > 0 && (
                <>
                  需要选择 
                  {minSelect === maxSelect ? (
                    <strong> {minSelect} </strong>
                  ) : maxSelect ? (
                    <strong> {minSelect}-{maxSelect} </strong>
                  ) : (
                    <strong> 至少{minSelect} </strong>
                  )}
                  项
                </>
              )}
              {selectedItems.length > 0 && (
                <span className="ml-2">
                  已选择 <strong>{selectedItems.length}</strong> 项
                  {maxSelect && remaining > 0 && (
                    <span>，还可选择 <strong>{remaining}</strong> 项</span>
                  )}
                </span>
              )}
            </p>
          </div>

          {/* 搜索框 */}
          {searchable && (
            <div className="relative">
              <label htmlFor="unified-selector-search" className="sr-only">搜索</label>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="unified-selector-search"
                name="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="搜索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="off"
              />
            </div>
          )}

          {/* 分类过滤 */}
          {categorizable && categories.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm transition ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm transition ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 内容列表 */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const isSelected = selectedItems.includes(item.id);
              const isDisabled = !isSelected && maxSelect !== undefined && selectedItems.length >= maxSelect;

              if (renderItem) {
                return (
                  <div
                    key={item.id}
                    onClick={() => !isDisabled && toggleItem(item.id)}
                    className={`cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {renderItem(item, isSelected)}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && toggleItem(item.id)}
                  disabled={isDisabled}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? 'border-green-500 bg-green-50'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 mb-1">{item.name}</div>
                      {showDescription && item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                      {item.category && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>没有找到匹配的项目</p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="border-t border-gray-200 p-4 flex justify-between items-center gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="btn btn-secondary"
          >
            取消
          </button>
          
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <button
                onClick={() => setSelectedItems([])}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                清空选择
              </button>
            )}
            <button
              onClick={handleConfirm}
              disabled={!isComplete}
              className="btn btn-primary"
            >
              确认选择
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
