'use client';

import { useState, useEffect, useRef } from 'react';
import { useCharacterStore } from '@/lib/character-store';
import { BookOpen, Upload, X } from 'lucide-react';

export default function StepBiography() {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [bioText, setBioText] = useState(currentCharacter?.backstory || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentCharacter?.avatar || null);
  const bioSyncRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bioTextRef = useRef(bioText);
  bioTextRef.current = bioText;

  // 与 store 同步：从 store 进入本步时用最新 backstory/avatar 初始化
  useEffect(() => {
    setBioText(currentCharacter?.backstory || '');
    setAvatarPreview(currentCharacter?.avatar || null);
  }, [currentCharacter?.id]); // 仅角色切换时重置，同角色内不覆盖本地输入

  // 防抖写入 backstory
  useEffect(() => {
    if (bioSyncRef.current) clearTimeout(bioSyncRef.current);
    bioSyncRef.current = setTimeout(() => {
      if (currentCharacter && bioText !== (currentCharacter.backstory || '')) {
        updateCurrentCharacter({ backstory: bioText });
      }
      bioSyncRef.current = null;
    }, 500);
    return () => {
      if (bioSyncRef.current) clearTimeout(bioSyncRef.current);
    };
  }, [bioText]);

  // 完成角色创建前由 create 页派发，将当前未失焦的传记内容写入 store
  useEffect(() => {
    const handler = () => {
      if (currentCharacter && bioTextRef.current !== (currentCharacter.backstory || '')) {
        updateCurrentCharacter({ backstory: bioTextRef.current });
      }
    };
    window.addEventListener('flushBiography', handler);
    return () => window.removeEventListener('flushBiography', handler);
  }, [currentCharacter, updateCurrentCharacter]);

  if (!currentCharacter) return null;

  const handleBlurBackstory = () => {
    if (bioText !== (currentCharacter.backstory || '')) {
      updateCurrentCharacter({ backstory: bioText });
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatarPreview(base64String);
        updateCurrentCharacter({ avatar: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    updateCurrentCharacter({ avatar: undefined });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">传记</h2>
        <p className="text-gray-600 mb-6">
          为你的角色上传立绘并书写个人传记（可选）。完成后点击底部「完成角色创建」进入角色卡。
        </p>
      </div>

      {/* 角色立绘 */}
      <div className="bg-white rounded-xl shadow-md border-2 border-gold-light p-6">
        <h3 className="text-lg font-cinzel font-bold text-leather-dark mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          角色立绘
        </h3>

        {avatarPreview ? (
          <div className="relative">
            <img
              src={avatarPreview}
              alt="角色立绘"
              className="max-w-md w-full h-auto rounded-lg shadow-lg border-4 border-gold-dark mx-auto"
            />
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">上传角色立绘图片（可选）</p>
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
      <div className="bg-white rounded-xl shadow-md border-2 border-gold-light p-6">
        <h3 className="text-lg font-cinzel font-bold text-leather-dark mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          个人传记
        </h3>

        <textarea
          value={bioText}
          onChange={(e) => setBioText(e.target.value)}
          onBlur={handleBlurBackstory}
          className="w-full h-64 p-4 border-2 border-purple-300 rounded-lg focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-all resize-none"
          placeholder="在这里书写你的角色故事...&#10;&#10;你是谁？&#10;你来自哪里？&#10;你的动机是什么？&#10;你有什么目标和梦想？"
        />
        <p className="text-sm text-gray-500 mt-2">内容会保存到角色卡「传记」页，之后可随时编辑。</p>
      </div>
    </div>
  );
}
