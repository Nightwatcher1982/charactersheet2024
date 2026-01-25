'use client';

import { useCharacterStore } from '@/lib/character-store';

export default function StepReview() {
  const { currentCharacter } = useCharacterStore();

  if (!currentCharacter) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">确认完成</h2>
        <p className="text-gray-600 mb-6">
          这是创建流程的最后一步。确认无误后，点击页面底部的“完成角色”将直接进入网页版角色卡。
        </p>
      </div>

      <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
        <div className="text-green-800 font-bold mb-1">✓ 角色创建就绪</div>
        <div className="text-green-700 text-sm">
          点击页面底部的“完成角色”后，会跳转到网页版角色卡页面。
        </div>
      </div>
      
      <div className="info-box mt-6">
        <div className="text-sm text-blue-900 font-semibold mb-2">保存角色卡（推荐：手机长截图/整页截图）</div>
        <div className="text-sm text-blue-800 space-y-2">
          <div>
            - <strong>iPhone（Safari）</strong>：进入角色卡后截图 → 点左下角截图缩略图 → 选择“整页” → 保存（通常保存到“文件”）。
          </div>
          <div>
            - <strong>安卓</strong>：进入角色卡后使用系统“滚动截图/长截图”功能保存。
          </div>
          <div className="text-xs text-blue-700">
            备注：网页版角色卡是分页样式；整页截图更适合留存与分享。
          </div>
        </div>
      </div>
    </div>
  );
}
