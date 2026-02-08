'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCharacterData } from '@/lib/character-data-context';
import { useState } from 'react';
import { HighlightEntry } from '@/lib/dnd-data';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, Star, Pin } from 'lucide-react';
import Link from 'next/link';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function CharacterHighlightsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { character, loading, error, updateCharacter } = useCharacterData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<HighlightEntry | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleCreateEntry = () => {
    const newEntry: HighlightEntry = {
      id: generateId(),
      title: '',
      content: '',
      occurredAt: new Date().toISOString().split('T')[0],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingEntry(newEntry);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditEntry = (entry: HighlightEntry) => {
    setEditingEntry({ ...entry });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSaveEntry = async () => {
    if (!character || !editingEntry || !editingEntry.title.trim()) {
      alert('请填写标题');
      return;
    }

    const updatedHighlights = [...(character.highlights || [])];
    
    if (isEditing) {
      const index = updatedHighlights.findIndex(e => e.id === editingEntry.id);
      if (index >= 0) {
        updatedHighlights[index] = {
          ...editingEntry,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      updatedHighlights.unshift(editingEntry);
    }

    await updateCharacter({ highlights: updatedHighlights });
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!character) return;
    if (!confirm('确定要删除这个高光时刻吗？')) return;
    const updatedHighlights = (character.highlights || []).filter(e => e.id !== entryId);
    await updateCharacter({ highlights: updatedHighlights });
  };

  const handleTogglePin = async (entryId: string) => {
    if (!character) return;
    const updatedHighlights = (character.highlights || []).map(e => 
      e.id === entryId ? { ...e, isPinned: !e.isPinned } : e
    );
    await updateCharacter({ highlights: updatedHighlights });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  if (error) {
    router.push('/');
    return null;
  }

  if (loading || !character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  const highlights = character.highlights || [];
  const pinnedHighlights = highlights.filter(h => h.isPinned);
  const unpinnedHighlights = highlights.filter(h => !h.isPinned);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 头部导航 */}
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/characters/${id}`} className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>返回角色档案</span>
          </Link>
          
          <button
            onClick={handleCreateEntry}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建高光
          </button>
        </div>

        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            {character.name} 的高光时刻
          </h1>
          <p className="text-gray-600">记录冒险中最精彩、最难忘的瞬间</p>
        </div>

        {/* 编辑表单 */}
        {showForm && editingEntry && (
          <div className="card mb-6 border-2 border-yellow-300">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isEditing ? '编辑高光时刻' : '新建高光时刻'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="highlight-title" className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                <input
                  id="highlight-title"
                  name="highlightTitle"
                  type="text"
                  value={editingEntry.title}
                  onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="高光时刻的标题"
                />
              </div>

              <div>
                <label htmlFor="highlight-date" className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  发生日期
                </label>
                <input
                  id="highlight-date"
                  name="highlightDate"
                  type="date"
                  value={editingEntry.occurredAt}
                  onChange={(e) => setEditingEntry({ ...editingEntry, occurredAt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="highlight-content" className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  id="highlight-content"
                  name="highlightContent"
                  value={editingEntry.content}
                  onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                  rows={6}
                  placeholder="描述这个精彩瞬间..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={editingEntry.isPinned || false}
                  onChange={(e) => setEditingEntry({ ...editingEntry, isPinned: e.target.checked })}
                  className="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                />
                <label htmlFor="isPinned" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Pin className="w-4 h-4" />
                  置顶显示
                </label>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveEntry}
                  className="btn btn-primary"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 置顶的高光时刻 */}
        {pinnedHighlights.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Pin className="w-5 h-5 text-yellow-600" />
              置顶高光
            </h2>
            <div className="space-y-4">
              {pinnedHighlights.map((entry) => (
                <div key={entry.id} className="card bg-gradient-to-r from-yellow-50 to-white border-2 border-yellow-300 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        <h3 className="text-xl font-bold text-gray-900">{entry.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {entry.occurredAt}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePin(entry.id)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        title="取消置顶"
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {entry.content && (
                    <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 其他高光时刻 */}
        {unpinnedHighlights.length > 0 && (
          <div>
            {pinnedHighlights.length > 0 && (
              <h2 className="text-xl font-bold text-gray-900 mb-3">其他高光</h2>
            )}
            <div className="space-y-4">
              {unpinnedHighlights.map((entry) => (
                <div key={entry.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-5 h-5 text-gray-400" />
                        <h3 className="text-xl font-bold text-gray-900">{entry.title}</h3>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        {entry.occurredAt}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTogglePin(entry.id)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                        title="置顶"
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditEntry(entry)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="编辑"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {entry.content && (
                    <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {highlights.length === 0 && (
          <div className="card text-center py-12">
            <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">还没有记录任何高光时刻</p>
            <button
              onClick={handleCreateEntry}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              创建第一个高光时刻
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
