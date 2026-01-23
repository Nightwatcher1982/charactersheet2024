'use client';

import { useCharacterStore } from '@/lib/character-store';
import { Download, FileText } from 'lucide-react';
import { generateCharacterPDF } from '@/lib/pdf-generator';
import CharacterSheetSummary from '@/components/CharacterSheetSummary';

export default function StepReview() {
  const { currentCharacter } = useCharacterStore();

  if (!currentCharacter) return null;

  const handleExportPDF = () => {
    if (currentCharacter) {
      generateCharacterPDF(currentCharacter as any);
    }
  };

  const handleViewSheet = () => {
    // 保存当前角色数据到localStorage，供角色卡页面读取
    localStorage.setItem('temp-character-for-sheet', JSON.stringify(currentCharacter));
    window.open('/character-sheet', '_blank');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="section-title">角色信息汇总</h2>
        <p className="text-gray-600 mb-6">
          检查你的完整角色信息，确认无误后可以导出角色卡。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={handleViewSheet}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <FileText className="w-5 h-5" />
          查看网页版角色卡
        </button>
        <button
          onClick={handleExportPDF}
          className="btn-secondary flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          导出 PDF
        </button>
      </div>

      {/* 使用新的角色信息汇总组件 */}
      <CharacterSheetSummary character={currentCharacter} />
      
      <div className="info-box mt-6">
        <p className="text-sm text-blue-800">
          💡 <strong>提示：</strong>点击&ldquo;查看网页版角色卡&rdquo;可以打开精美的2页角色卡，适合打印和保存。
        </p>
      </div>
    </div>
  );
}
