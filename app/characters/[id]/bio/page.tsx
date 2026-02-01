'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCharacterStore } from '@/lib/character-store';
import { useEffect, useState } from 'react';
import { Character, Biography } from '@/lib/dnd-data';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CharacterBioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { characters, updateCurrentCharacter, saveCharacter, setCurrentCharacter } = useCharacterStore();
  const [character, setCharacter] = useState<Character | null>(null);
  const [biography, setBiography] = useState<Biography>({
    appearance: '',
    personality: '',
    relationships: '',
    timeline: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    const found = characters.find((c) => c.id === id);
    if (found) {
      setCharacter(found as Character);
      if (found.biography) {
        setBiography(found.biography);
      }
    } else {
      router.push('/');
    }
  }, [id, characters, router]);

  const handleSave = async () => {
    if (!character) return;
    
    setIsSaving(true);
    
    // 更新角色的传记信息
    const updatedCharacter = {
      ...character,
      biography,
      updatedAt: new Date().toISOString()
    };
    
    // 更新store中的角色
    setCurrentCharacter(updatedCharacter);
    saveCharacter();
    setCharacter(updatedCharacter);
    
    setTimeout(() => {
      setIsSaving(false);
    }, 500);
  };

  const addTimelineEvent = () => {
    setBiography(prev => ({
      ...prev,
      timeline: [
        ...(prev.timeline || []),
        { date: '', event: '' }
      ]
    }));
    setShowTimeline(true);
  };

  const updateTimelineEvent = (index: number, field: 'date' | 'event', value: string) => {
    setBiography(prev => ({
      ...prev,
      timeline: prev.timeline?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ) || []
    }));
  };

  const removeTimelineEvent = (index: number) => {
    setBiography(prev => ({
      ...prev,
      timeline: prev.timeline?.filter((_, i) => i !== index) || []
    }));
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
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '保存中...' : '保存传记'}
          </button>
        </div>

        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{character.name} 的传记</h1>
          <p className="text-gray-600">记录角色的外观、性格、关系网和重要经历</p>
        </div>

        {/* 传记表单 */}
        <div className="space-y-6">
          {/* 外观描述 */}
          <div className="card">
            <label className="block mb-2">
              <span className="text-lg font-semibold text-gray-900">外观描述</span>
              <span className="text-sm text-gray-600 ml-2">身高、体重、发色、眼色、特征等</span>
            </label>
            <textarea
              value={biography.appearance || ''}
              onChange={(e) => setBiography(prev => ({ ...prev, appearance: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
              placeholder="描述角色的外貌特征..."
            />
          </div>

          {/* 性格与信念 */}
          <div className="card">
            <label className="block mb-2">
              <span className="text-lg font-semibold text-gray-900">性格与信念</span>
              <span className="text-sm text-gray-600 ml-2">个性、价值观、理想、羁绊、缺陷</span>
            </label>
            <textarea
              value={biography.personality || ''}
              onChange={(e) => setBiography(prev => ({ ...prev, personality: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={6}
              placeholder="描述角色的性格特点、信仰、理想、羁绊和缺陷..."
            />
          </div>

          {/* 关系网 */}
          <div className="card">
            <label className="block mb-2">
              <span className="text-lg font-semibold text-gray-900">关系网</span>
              <span className="text-sm text-gray-600 ml-2">家人、朋友、敌人、盟友</span>
            </label>
            <textarea
              value={biography.relationships || ''}
              onChange={(e) => setBiography(prev => ({ ...prev, relationships: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={5}
              placeholder="描述角色的重要关系..."
            />
          </div>

          {/* 重要事件年表 */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">重要事件年表</h2>
                <p className="text-sm text-gray-600">记录角色生命中的关键时刻</p>
              </div>
              <button
                onClick={addTimelineEvent}
                className="btn btn-secondary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加事件
              </button>
            </div>

            {biography.timeline && biography.timeline.length > 0 ? (
              <div className="space-y-3">
                {biography.timeline.map((event, index) => (
                  <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
                    <label htmlFor={`timeline-date-${index}`} className="sr-only">日期/年龄</label>
                    <input
                      id={`timeline-date-${index}`}
                      name={`timelineDate-${index}`}
                      type="text"
                      value={event.date}
                      onChange={(e) => updateTimelineEvent(index, 'date', e.target.value)}
                      placeholder="日期/年龄"
                      className="w-32 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <label htmlFor={`timeline-event-${index}`} className="sr-only">事件描述</label>
                    <input
                      id={`timeline-event-${index}`}
                      name={`timelineEvent-${index}`}
                      type="text"
                      value={event.event}
                      onChange={(e) => updateTimelineEvent(index, 'event', e.target.value)}
                      placeholder="事件描述"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeTimelineEvent(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="删除事件"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">暂无事件记录，点击上方按钮添加</p>
            )}
          </div>

          {/* 原有的背景故事（从创建时填写） */}
          {character.backstory && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">背景故事</h2>
              <p className="text-sm text-gray-600 mb-3">创建角色时填写的背景故事</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{character.backstory}</p>
              </div>
            </div>
          )}
        </div>

        {/* 底部保存按钮 */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary px-8"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? '保存中...' : '保存传记'}
          </button>
        </div>
      </div>
    </div>
  );
}
