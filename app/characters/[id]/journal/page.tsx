'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCharacterStore } from '@/lib/character-store';
import { useEffect, useState } from 'react';
import { Character, JournalEntry } from '@/lib/dnd-data';
import { ArrowLeft, Plus, Edit, Trash2, Calendar, MapPin, Users, Tag } from 'lucide-react';
import Link from 'next/link';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function CharacterJournalPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { characters, setCurrentCharacter, saveCharacter } = useCharacterStore();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const found = characters.find((c) => c.id === id);
    if (found) {
      setCharacter(found as Character);
    } else {
      router.push('/');
    }
  }, [id, characters, router]);

  const handleCreateEntry = () => {
    const newEntry: JournalEntry = {
      id: generateId(),
      title: '',
      content: '',
      occurredAt: new Date().toISOString().split('T')[0],
      location: '',
      participants: [],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingEntry(newEntry);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry({ ...entry });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSaveEntry = () => {
    if (!character || !editingEntry || !editingEntry.title.trim()) {
      alert('请填写标题');
      return;
    }

    const updatedJournal = [...(character.journal || [])];
    
    if (isEditing) {
      const index = updatedJournal.findIndex(e => e.id === editingEntry.id);
      if (index >= 0) {
        updatedJournal[index] = {
          ...editingEntry,
          updatedAt: new Date().toISOString()
        };
      }
    } else {
      updatedJournal.unshift(editingEntry);
    }

    const updatedCharacter = {
      ...character,
      journal: updatedJournal,
      updatedAt: new Date().toISOString()
    };

    setCurrentCharacter(updatedCharacter);
    saveCharacter();
    setCharacter(updatedCharacter);
    setShowForm(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!character) return;
    
    if (confirm('确定要删除这条日志吗？')) {
      const updatedJournal = (character.journal || []).filter(e => e.id !== entryId);
      const updatedCharacter = {
        ...character,
        journal: updatedJournal,
        updatedAt: new Date().toISOString()
      };

      setCurrentCharacter(updatedCharacter);
      saveCharacter();
      setCharacter(updatedCharacter);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  if (!character) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  const journal = character.journal || [];

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
            新建日志
          </button>
        </div>

        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{character.name} 的冒险日志</h1>
          <p className="text-gray-600">记录冒险过程中的重要事件和经历</p>
        </div>

        {/* 编辑表单 */}
        {showForm && editingEntry && (
          <div className="card mb-6 border-2 border-blue-300">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {isEditing ? '编辑日志' : '新建日志'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="journal-title" className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                <input
                  id="journal-title"
                  name="journalTitle"
                  type="text"
                  value={editingEntry.title}
                  onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="日志标题"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="journal-date" className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    发生日期
                  </label>
                  <input
                    id="journal-date"
                    name="journalDate"
                    type="date"
                    value={editingEntry.occurredAt}
                    onChange={(e) => setEditingEntry({ ...editingEntry, occurredAt: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="journal-location" className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    地点
                  </label>
                  <input
                    id="journal-location"
                    name="journalLocation"
                    type="text"
                    value={editingEntry.location || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="事件发生地点"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="journal-participants" className="block text-sm font-medium text-gray-700 mb-1">
                  <Users className="w-4 h-4 inline mr-1" />
                  参与者
                </label>
                <input
                  id="journal-participants"
                  name="journalParticipants"
                  type="text"
                  value={editingEntry.participants?.join(', ') || ''}
                  onChange={(e) => setEditingEntry({ 
                    ...editingEntry, 
                    participants: e.target.value.split(',').map(p => p.trim()).filter(p => p) 
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="用逗号分隔多个参与者"
                />
              </div>

              <div>
                <label htmlFor="journal-tags" className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag className="w-4 h-4 inline mr-1" />
                  标签
                </label>
                <input
                  id="journal-tags"
                  name="journalTags"
                  type="text"
                  value={editingEntry.tags?.join(', ') || ''}
                  onChange={(e) => setEditingEntry({ 
                    ...editingEntry, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="如：战斗、探索、社交等，用逗号分隔"
                />
              </div>

              <div>
                <label htmlFor="journal-content" className="block text-sm font-medium text-gray-700 mb-1">内容</label>
                <textarea
                  id="journal-content"
                  name="journalContent"
                  value={editingEntry.content}
                  onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={8}
                  placeholder="记录这次冒险的详细内容..."
                />
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
                  保存日志
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 日志列表 */}
        {journal.length > 0 ? (
          <div className="space-y-4">
            {journal.map((entry) => (
              <div key={entry.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{entry.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {entry.occurredAt}
                      </span>
                      {entry.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {entry.location}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
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

                {entry.participants && entry.participants.length > 0 && (
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      <Users className="w-4 h-4 inline mr-1" />
                      参与者：
                    </span>
                    <span className="text-sm text-gray-600">{entry.participants.join(', ')}</span>
                  </div>
                )}

                {entry.content && (
                  <p className="text-gray-700 whitespace-pre-wrap mb-3">{entry.content}</p>
                )}

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">还没有任何日志记录</p>
            <button
              onClick={handleCreateEntry}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              创建第一条日志
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
