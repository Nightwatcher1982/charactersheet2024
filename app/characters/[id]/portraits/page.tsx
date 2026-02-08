'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCharacterData } from '@/lib/character-data-context';
import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2, X, ZoomIn, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/asset-path';

export default function CharacterPortraitsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { character, loading, error, updateCharacter } = useCharacterData();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 管理大图预览时的滚动锁定
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedImage]);
  
  // 清理函数 - 只在组件卸载时执行
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !character) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('characterId', id);
      const res = await fetch(getApiUrl('/api/upload/portrait'), { method: 'POST', body: formData });
      const data = await res.json();

      if (res.ok && data.url) {
        const updatedPortraits = [...(character.portraits || []), data.url];
        await updateCharacter({ portraits: updatedPortraits });
      } else {
        // OSS 未配置或失败时退回 base64（如本地开发）
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('图片读取失败'));
          reader.readAsDataURL(file);
        });
        const updatedPortraits = [...(character.portraits || []), base64String];
        await updateCharacter({ portraits: updatedPortraits });
      }
    } catch {
      alert('上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (index: number) => {
    if (!character) return;
    if (!confirm('确定要删除这张图片吗？')) return;
    const updatedPortraits = (character.portraits || []).filter((_, i) => i !== index);
    await updateCharacter({ portraits: updatedPortraits });
  };

  const handleSetAsAvatar = async (imageUrl: string) => {
    if (!character) return;
    await updateCharacter({ avatar: imageUrl });
    alert('已设置为头像');
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

  const portraits = character.portraits || [];
  const allImages = [character.avatar, ...portraits].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 头部导航 */}
        <div className="mb-6 flex items-center justify-between">
          <Link href={`/characters/${id}`} className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>返回角色档案</span>
          </Link>
          
          <label className="btn btn-primary flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" />
            {isUploading ? '上传中...' : '添加图片'}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        </div>

        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{character.name} 的立绘画册</h1>
          <p className="text-gray-600">管理角色的立绘、头像和其他图片</p>
        </div>

        {/* 当前头像 */}
        {character.avatar && (
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">当前头像</h2>
            <div className="flex gap-4 items-start">
              <img
                src={character.avatar}
                alt="当前头像"
                className="w-48 h-48 object-cover rounded-lg shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(character.avatar || null)}
              />
              <div className="flex-1">
                <p className="text-gray-600 mb-4">这是角色档案中显示的头像图片</p>
                <button
                  onClick={() => handleSetAsAvatar('')}
                  className="btn btn-secondary text-sm"
                >
                  移除头像
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 图片画册 */}
        {portraits.length > 0 ? (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              立绘画册 ({portraits.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portraits.map((imageUrl, index) => (
                <div key={index} className="relative group">
                  <img
                    src={imageUrl}
                    alt={`立绘 ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImage(imageUrl)}
                  />
                  
                  {/* 悬浮操作按钮 */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setSelectedImage(imageUrl)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="查看大图"
                    >
                      <ZoomIn className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleSetAsAvatar(imageUrl)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                      title="设为头像"
                    >
                      <ImageIcon className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(index)}
                      className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          !character.avatar && (
            <div className="card text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">还没有添加任何图片</p>
              <label className="btn btn-primary inline-flex items-center gap-2 cursor-pointer">
                <Plus className="w-4 h-4" />
                上传第一张图片
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )
        )}

        {/* 使用提示 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">提示</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 点击图片可以查看大图</li>
            <li>• 鼠标悬停在图片上可以看到操作按钮</li>
            <li>• 单张图片大小限制为 2MB</li>
            <li>• 图片将上传至 OSS（未配置时以 base64 存于本地）</li>
          </ul>
        </div>
      </div>

      {/* 大图预览模态框 */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
          
          <img
            src={selectedImage}
            alt="预览"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
