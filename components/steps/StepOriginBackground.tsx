'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCharacterStore } from '@/lib/character-store';
import { BACKGROUNDS } from '@/lib/dnd-data';
import { getFeatById } from '@/lib/feats-data';
import { Check, ChevronDown, ChevronUp, Star, ArrowRight, Info, Package } from 'lucide-react';
import EquipmentSelector from '@/components/EquipmentSelector';
import BackgroundAbilityBonus from '@/components/BackgroundAbilityBonus';
import Image from 'next/image';

// 背景简介（一句话）
const getBackgroundSummary = (backgroundName: string): string => {
  const summaryMap: Record<string, string> = {
    '侍僧': '在神殿中服侍的虔诚信徒，精通宗教仪式和神圣知识',
    '工匠': '技艺精湛的手工艺者，擅长制作和修理物品',
    '骗子': '善于欺骗和伪装的骗术大师',
    '罪犯': '游走在法律边缘的不法之徒，精通隐秘行动',
    '艺人': '娱乐大众的表演者，擅长魅力社交',
    '农民': '勤劳朴实的乡村劳动者，拥有丰富的生存技能',
    '警卫': '维护治安的卫士，训练有素的战斗人员',
    '向导': '熟悉地形的引路人，擅长追踪和求生',
    '隐士': '隐居修行的智者，拥有深邃的洞察力',
    '商人': '精明的贸易商人，熟谙商业之道',
    '贵族': '出身显赫的上流社会成员，掌握政治与礼仪',
    '智者': '致力于学术研究的学者，拥有渊博的知识',
    '水手': '航海经验丰富的船员，适应海上生活',
    '抄写员': '精通文字的书记官，擅长记录和研究',
    '士兵': '经过严格训练的战士，拥有战场经验',
    '流浪者': '四处游历的旅人，见多识广且适应力强',
  };
  return summaryMap[backgroundName] || '一个独特的成长经历';
};

// 背景图标路径映射
const getBackgroundImagePath = (backgroundName: string): string => {
  const imageMap: Record<string, string> = {
    '侍僧': '/pic/background/侍僧.jpg',
    '工匠': '/pic/background/工匠.jpg',
    '骗子': '/pic/background/骗子.jpg',
    '罪犯': '/pic/background/罪犯.webp',
    '艺人': '/pic/background/艺人.jpg',
    '农民': '/pic/background/农民.jpg',
    '警卫': '/pic/background/警卫.jpg',
    '向导': '/pic/background/向导.jpg',
    '隐士': '/pic/background/隐士.jpg',
    '商人': '/pic/background/商人.jpg',
    '贵族': '/pic/background/贵族.jpg',
    '智者': '/pic/background/智者.jpg',
    '水手': '/pic/background/水手.jpg',
    '抄写员': '/pic/background/抄写员.jpg',
    '士兵': '/pic/background/士兵.jpg',
    '流浪者': '/pic/background/流浪者.jpg',
  };
  return imageMap[backgroundName] || '/pic/background/侍僧.jpg';
};

interface StepOriginBackgroundProps {
  onNextSubStep?: () => void;
}

export default function StepOriginBackground({ onNextSubStep }: StepOriginBackgroundProps) {
  const { currentCharacter, updateCurrentCharacter } = useCharacterStore();
  const [expandedBackground, setExpandedBackground] = useState<string | null>(null);
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);
  const [showAbilityBonus, setShowAbilityBonus] = useState(false);
  const [tempEquipmentChoice, setTempEquipmentChoice] = useState<'A' | 'B' | null>(null);

  // 清理函数 - 只在组件卸载时执行
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!currentCharacter) return null;

  // 点击「下一步」时由 StepOrigin 派发，打开背景配置弹窗
  useEffect(() => {
    const handleTriggerConfig = () => {
      if (currentCharacter?.background) {
        setShowAbilityBonus(true);
        setShowEquipmentSelector(false);
        setTempEquipmentChoice(null);
      }
    };
    window.addEventListener('triggerBackgroundConfiguration', handleTriggerConfig);
    return () => window.removeEventListener('triggerBackgroundConfiguration', handleTriggerConfig);
  }, [currentCharacter?.background]);

  const handleSelectBackground = (backgroundName: string) => {
    // 仅高亮选择，不打开弹窗；点「下一步」再打开配置
    const bg = BACKGROUNDS.find(b => b.name === backgroundName);
    if (bg) {
      const isDifferentBackground = currentCharacter.background !== backgroundName;
      updateCurrentCharacter({
        background: backgroundName,
        ...(isDifferentBackground && {
          backgroundAbilityBonuses: {},
          backgroundEquipmentChoice: undefined
        })
      });
    }
  };

  const handleAbilityBonusComplete = (bonuses: Record<string, number>) => {
    updateCurrentCharacter({
      backgroundAbilityBonuses: bonuses
    });
    // 主属性选择完成后，显示装备选择
    setShowAbilityBonus(false);
    setTempEquipmentChoice(currentCharacter.backgroundEquipmentChoice || null);
    setShowEquipmentSelector(true);
  };

  const handleEquipmentSelect = (choice: 'A' | 'B') => {
    // 只选中装备，不立即进入下一步
    updateCurrentCharacter({
      backgroundEquipmentChoice: choice
    });
  };

  const handleEquipmentComplete = () => {
    // 保存临时选择到实际的 character store
    if (tempEquipmentChoice) {
      updateCurrentCharacter({
        backgroundEquipmentChoice: tempEquipmentChoice
      });
    }
    // 装备选择完成，返回起源步骤主界面，让用户继续选择物种
    setShowEquipmentSelector(false);
    setShowAbilityBonus(false);
    setTempEquipmentChoice(null);
    // 调用父组件的回调，进入下一个子步骤（物种）
    if (onNextSubStep) {
      onNextSubStep();
    }
  };

  // 显示主属性加值选择弹窗
  if (currentCharacter.background && showAbilityBonus) {
    const background = BACKGROUNDS.find(b => b.name === currentCharacter.background);
    if (!background) return null;

    // 获取背景的专长信息
    const feat = getFeatById(background.featId as string);

    return (
      <>
        {/* 主属性加值选择弹窗 - Portal 挂载到 body，z-[100] */}
        {typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            {/* 标题栏 */}
            <div className="bg-leather-dark text-white p-4 flex items-center justify-between border-b-2 border-gold-dark flex-shrink-0">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-gold-light" />
                <h3 className="font-bold text-xl font-cinzel">
                  {background.name} - 选择主属性加值
                </h3>
              </div>
              <button
                onClick={() => setShowAbilityBonus(false)}
                className="hover:bg-leather-base rounded-full p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 内容区 */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <BackgroundAbilityBonus
                key={background.name} // 添加 key 确保背景切换时重新渲染
                availableAbilities={background.abilityChoices || ['力量', '敏捷', '体质', '智力', '感知', '魅力']}
                onComplete={handleAbilityBonusComplete}
                initialBonuses={currentCharacter.backgroundAbilityBonuses}
                backgroundName={background.name}
                backgroundSummary={getBackgroundSummary(background.name)}
                backgroundSkills={background.skills}
                backgroundTools={background.toolProficiency}
                backgroundFeat={feat?.name}
              />
            </div>

            {/* 底部按钮 */}
            <div className="p-4 border-t-2 border-gray-200 bg-white flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowAbilityBonus(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors border border-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>,
        document.body
        )}
        
        {/* 显示背景内容，保持页面布局 */}
        <div className="opacity-0 pointer-events-none min-h-[500px]">
          <div className="space-y-6">
            <div>
              <h2 className="section-title">确定起源</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  // 显示装备选择弹窗
  if (currentCharacter.background && showEquipmentSelector) {
    const background = BACKGROUNDS.find(b => b.name === currentCharacter.background);
    if (!background) return null;

    // 首次进入装备选择时，添加背景的技能和专长
    if (!currentCharacter.feats?.includes(background.featId as string)) {
      const currentSkills = currentCharacter.skills || [];
      const oldBg = BACKGROUNDS.find(b => b.name !== currentCharacter.background && currentSkills.some(s => b.skills.includes(s)));
      const skillsWithoutOldBg = oldBg 
        ? currentSkills.filter(skill => !oldBg.skills.includes(skill))
        : currentSkills;
      const newSkills = [...skillsWithoutOldBg, ...background.skills];
      
      updateCurrentCharacter({ 
        feats: [background.featId as string],
        skills: newSkills
      });
    }

    return (
      <>
        {/* 背景装备选择弹窗 - Portal 挂载到 body，z-[100] */}
        {typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            {/* 标题栏 */}
            <div className="bg-leather-dark text-white p-4 flex items-center justify-between border-b-2 border-gold-dark flex-shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-6 h-6 text-gold-light" />
                <h3 className="font-bold text-xl font-cinzel">
                  {background.name} - 选择起始装备
                </h3>
              </div>
              <button
                onClick={() => setShowEquipmentSelector(false)}
                className="hover:bg-leather-base rounded-full p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 内容区 */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <EquipmentSelector
                backgroundId={background.id}
                backgroundName={background.name}
                initialChoice={tempEquipmentChoice || undefined}
                onComplete={(choice) => {
                  // 保存到临时状态
                  setTempEquipmentChoice(choice);
                }}
                autoConfirm={false}
                showConfirmButton={false}
              />
            </div>

            {/* 底部按钮 */}
            <div className="p-4 border-t-2 border-gray-200 bg-white flex gap-3 flex-shrink-0">
              <button
                onClick={() => {
                  setShowEquipmentSelector(false);
                  setTempEquipmentChoice(null);
                }}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-semibold transition-colors border border-gray-300"
              >
                取消
              </button>
              <button
                onClick={handleEquipmentComplete}
                disabled={!tempEquipmentChoice}
                className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                  tempEquipmentChoice
                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                }`}
              >
                <Check className={`w-5 h-5 ${tempEquipmentChoice ? 'text-white' : 'text-gray-500'}`} />
                <span className={tempEquipmentChoice ? 'text-white' : 'text-gray-500'}>确认选择</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
        )}
        
        {/* 显示背景内容，保持页面布局 */}
        <div className="opacity-0 pointer-events-none min-h-[500px]">
          <div className="space-y-6">
            <div>
              <h2 className="section-title">确定起源</h2>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 - 与职业页一致 */}
      <h3 className="text-xl font-bold text-leather-dark font-cinzel">选择背景</h3>

      {/* 背景网格 - 4列布局，间距足够避免框体重叠 */}
      <div className="grid grid-cols-4 gap-6 justify-items-center">
        {BACKGROUNDS.map((background) => {
          const bgImagePath = getBackgroundImagePath(background.name);
          const isSelected = currentCharacter.background === background.name;
          
          return (
            <button
              key={background.id}
              onClick={() => handleSelectBackground(background.name)}
              className={`w-fit p-0 rounded-xl transition-all flex flex-col items-center gap-2 relative ${
                isSelected
                  ? 'border-2 border-blue-500 bg-blue-50 shadow-md'
                  : 'border-2 border-leather-light bg-white hover:border-blue-400 hover:shadow-md'
              }`}
            >
              {/* 图标 - 与职业页一致 w-20 h-20 (80px) */}
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={bgImagePath}
                  alt={background.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 背景名称 */}
              <div className="text-center">
                <h3 className="font-bold text-leather-dark font-cinzel">
                  {background.name}
                </h3>
              </div>
            </button>
          );
        })}
      </div>

      {/* 底部描述框 - 与职业页一致的比例与样式 */}
      {currentCharacter.background && (() => {
        const selectedBg = BACKGROUNDS.find(b => b.name === currentCharacter.background);
        const feat = selectedBg ? getFeatById(selectedBg.featId as string) : null;
        
        return (
          <div className="bg-parchment-base border-2 border-gold-light rounded-lg p-4 shadow-dnd mt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-gold-dark flex-shrink-0 mt-0.5" />
              <div className="text-sm text-leather-dark flex-1">
                <strong className="block mb-1">已选择：{currentCharacter.background}</strong>
                <p className="text-leather-base mb-2">
                  {getBackgroundSummary(currentCharacter.background)}
                </p>
                {selectedBg && (
                  <p className="text-leather-base/90 text-xs">
                    技能 {selectedBg.skills.join('、')} · 工具 {selectedBg.toolProficiency} · 专长 {feat?.name || selectedBg.featId}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
