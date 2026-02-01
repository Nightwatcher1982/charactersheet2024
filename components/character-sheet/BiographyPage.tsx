'use client';

import { useState } from 'react';
import { Character } from '@/lib/dnd-data';
import { BookOpen, Save, Edit3, Upload, X } from 'lucide-react';

interface BiographyPageProps {
  character: Partial<Character>;
  onUpdate: (updates: Partial<Character>) => void;
}

export default function BiographyPage({ character, onUpdate }: BiographyPageProps) {
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioText, setBioText] = useState(character.backstory || '');
  const [journalEntries, setJournalEntries] = useState<string[]>([]);
  const [newEntry, setNewEntry] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(character.avatar || null);

  const handleSaveBio = () => {
    onUpdate({ backstory: bioText });
    setIsEditingBio(false);
  };

  const handleAddEntry = () => {
    if (newEntry.trim()) {
      setJournalEntries([...journalEntries, newEntry]);
      setNewEntry('');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        onUpdate({ avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    onUpdate({ avatar: undefined });
  };

  return (
    <div className="space-y-6">
      {/* 角色立绘上传 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light p-6">
        <h2 className="text-2xl font-cinzel font-bold text-leather-dark mb-4 flex items-center gap-2">
          <Upload className="w-6 h-6" />
          角色立绘
        </h2>

        {avatarPreview ? (
          <div className="relative">
            <img
              src={avatarPreview}
              alt="角色立绘"
              className="max-w-md w-full h-auto rounded-lg shadow-lg border-4 border-gold-dark mx-auto"
            />
            <button
              onClick={handleRemoveAvatar}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">上传角色立绘图片</p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors font-bold">
              <Upload className="w-4 h-4" />
              选择图片
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">支持 JPG、PNG、GIF 等格式</p>
          </div>
        )}
      </div>

      {/* 个人传记 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-cinzel font-bold text-leather-dark flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            个人传记
          </h2>
          {!isEditingBio ? (
            <button
              onClick={() => setIsEditingBio(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-bold"
            >
              <Edit3 className="w-4 h-4" />
              编辑
            </button>
          ) : (
            <button
              onClick={handleSaveBio}
              className="flex items-center gap-2 px-4 py-2 bg-gold-dark hover:bg-gold-base text-white rounded-lg transition-colors font-bold"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
          )}
        </div>

        {isEditingBio ? (
          <textarea
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            className="w-full h-64 p-4 border-2 border-purple-300 rounded-lg focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
            placeholder="在这里书写你的角色故事...&#10;&#10;你是谁？&#10;你来自哪里？&#10;你的动机是什么？&#10;你有什么目标和梦想？"
          />
        ) : (
          <div className="prose max-w-none">
            {bioText ? (
              <div className="bg-parchment-base rounded-lg p-6 border-2 border-gold-light">
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {bioText}
                </p>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">还没有传记内容</p>
                <p className="text-sm text-gray-400">点击&quot;编辑&quot;按钮开始书写你的故事</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 冒险日志 */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gold-light p-6">
        <h2 className="text-2xl font-cinzel font-bold text-leather-dark mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          冒险日志
        </h2>

        {/* 添加新日志 */}
        <div className="mb-6">
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            className="w-full h-32 p-4 border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
            placeholder="记录今天的冒险经历..."
          />
          <button
            onClick={handleAddEntry}
            disabled={!newEntry.trim()}
            className="mt-2 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-bold"
          >
            <Save className="w-4 h-4" />
            添加日志
          </button>
        </div>

        {/* 日志列表 */}
        {journalEntries.length > 0 ? (
          <div className="space-y-4">
            {journalEntries.map((entry, index) => (
              <div
                key={index}
                className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {entry}
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date().toLocaleDateString('zh-CN')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-2">还没有日志记录</p>
            <p className="text-sm text-gray-400">在上方输入框中记录你的冒险故事</p>
          </div>
        )}
      </div>
    </div>
  );
}
