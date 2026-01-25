'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/lib/character-store';
import { ArrowLeft, ArrowRight, Save, Home } from 'lucide-react';

// 步骤组件 - 按照 DND 2024 官方流程
import StepWelcome from '@/components/steps/StepWelcome';
import StepClassSimple from '@/components/steps/StepClassSimple';
import StepOrigin from '@/components/steps/StepOrigin';
import StepAbilities from '@/components/steps/StepAbilities';
import StepAlignment from '@/components/steps/StepAlignment';
import StepSkills from '@/components/steps/StepSkills';
import StepReview from '@/components/steps/StepReview';

// 新的步骤结构 - 完全遵循官方流程
const STEPS = [
  { id: 0, title: '欢迎', shortTitle: '开始', component: StepWelcome, icon: '👋' },
  { id: 1, title: '选择职业', shortTitle: '职业', component: StepClassSimple, icon: '⚔️' },
  { id: 2, title: '确定起源', shortTitle: '起源', component: StepOrigin, icon: '📜', hasSubsteps: true },
  { id: 3, title: '确定属性值', shortTitle: '属性', component: StepAbilities, icon: '💪' },
  { id: 4, title: '选择阵营', shortTitle: '阵营', component: StepAlignment, icon: '⚖️' },
  { id: 5, title: '技能总览', shortTitle: '技能', component: StepSkills, icon: '🎯' },
  { id: 6, title: '审核完成', shortTitle: '完成', component: StepReview, icon: '✅' },
];

export default function CreateCharacterPage() {
  const router = useRouter();
  const { currentCharacter, currentStep, setStep, nextStep, prevStep, saveCharacter, resetWizard } = useCharacterStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 如果没有当前角色，返回首页
    if (mounted && !currentCharacter) {
      router.push('/');
    }
  }, [currentCharacter, mounted, router]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      nextStep();
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      prevStep();
      window.scrollTo(0, 0);
    }
  };

  const handleSave = () => {
    saveCharacter();
    alert('角色已保存！');
  };

  const handleFinish = () => {
    saveCharacter();
    // 保存一份临时数据给网页版角色卡读取（同页跳转，不开新窗口）
    try {
      localStorage.setItem('temp-character-for-sheet', JSON.stringify(currentCharacter));
    } catch {
      // 忽略：极端环境下 localStorage 不可用
    }
    router.push('/character-sheet');
  };

  const handleGoHome = () => {
    if (confirm('确定要离开吗？未保存的更改将会丢失。')) {
      router.push('/');
    }
  };

  if (!mounted || !currentCharacter) {
    return null;
  }

  const CurrentStepComponent = STEPS[currentStep].component;

  // 检查步骤2（起源）的所有子步骤是否完成
  const isStep2Complete = currentStep === 2 ? Boolean(
    currentCharacter?.background &&
    currentCharacter?.backgroundEquipmentChoice &&
    currentCharacter?.backgroundAbilityBonuses &&
    Object.keys(currentCharacter.backgroundAbilityBonuses).length > 0 &&
    Object.values(currentCharacter.backgroundAbilityBonuses).reduce((a: number, b: number) => a + b, 0) === 3 &&
    currentCharacter?.species &&
    currentCharacter?.languages &&
    currentCharacter.languages.length >= 3
  ) : true;

  const hasAllAbilityScores = (raw: unknown): raw is Record<string, number> => {
    if (!raw || typeof raw !== 'object') return false;
    const obj = raw as Record<string, unknown>;
    const keys = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const;
    return keys.every((k) => typeof obj[k] === 'number' && Number.isFinite(obj[k] as number));
  };

  const isStandardArray = (abilities: Record<string, number>): boolean => {
    const expected = [15, 14, 13, 12, 10, 8].sort((a, b) => a - b);
    const actual = [
      abilities.strength,
      abilities.dexterity,
      abilities.constitution,
      abilities.intelligence,
      abilities.wisdom,
      abilities.charisma,
    ].slice().sort((a, b) => a - b);
    return actual.length === expected.length && actual.every((v, i) => v === expected[i]);
  };

  const isPointBuyComplete = (abilities: Record<string, number>): boolean => {
    const POINT_COST: Record<number, number> = {
      8: 0,
      9: 1,
      10: 2,
      11: 3,
      12: 4,
      13: 5,
      14: 7,
      15: 9,
    };
    const vals = [
      abilities.strength,
      abilities.dexterity,
      abilities.constitution,
      abilities.intelligence,
      abilities.wisdom,
      abilities.charisma,
    ];
    if (!vals.every((v) => Number.isFinite(v) && v >= 8 && v <= 15)) return false;
    const cost = vals.reduce((sum, v) => sum + (POINT_COST[v] ?? 999), 0);
    return cost === 27;
  };

  // 检查步骤3（属性）是否完成：避免 abilities 为空对象导致最终角色卡全空值
  const isStep3Complete = (() => {
    if (currentStep !== 3) return true;
    const abilities = currentCharacter?.abilities;
    if (!hasAllAbilityScores(abilities)) return false;

    const method = currentCharacter?.abilityGenerationMethod;
    // 兼容旧数据：如果没有保存生成方式，只要 6 项都是数值就放行（避免把旧角色卡死在这里）
    if (!method) return true;

    if (method === 'standard-array') return isStandardArray(abilities);
    if (method === 'point-buy') return isPointBuyComplete(abilities);
    // manual：只要求填了 6 项数值
    return true;
  })();

  // 禁用"下一步"按钮的条件
  const isNextDisabled =
    (currentStep === 2 && !isStep2Complete) ||
    (currentStep === 3 && !isStep3Complete);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 顶部导航 */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleGoHome}
              className="btn-secondary flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              返回首页
            </button>

            <button
              onClick={handleSave}
              className="btn-outline flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存进度
            </button>
          </div>

          {/* 横向流程引导（从第2步开始显示） */}
          {currentStep > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-700">
                  当前步骤：{STEPS[currentStep].title}
                </div>
                <div className="text-sm text-gray-500">
                  {currentStep + 1} / {STEPS.length}
                </div>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {STEPS.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  const isAccessible = index <= currentStep;

                  return (
                    <button
                      key={step.id}
                      onClick={() => isAccessible && setStep(index)}
                      disabled={!isAccessible}
                      className={`flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium whitespace-nowrap transition ${
                        isActive
                          ? 'bg-red-500 text-white border-red-500'
                          : isCompleted
                          ? 'bg-green-50 text-green-800 border-green-200 hover:bg-green-100'
                          : isAccessible
                          ? 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                      }`}
                    >
                      <span>{step.icon}</span>
                      <span>{step.shortTitle}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="card min-h-[500px]">
          <CurrentStepComponent />
        </div>

        {currentStep === 3 && !isStep3Complete && (
          <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <div className="font-bold text-yellow-900 mb-1">需要先完成属性分配</div>
            <div className="text-sm text-yellow-800">
              请先在本页完成属性值分配（标准数组需分配完 6 个数值；购点法需花完 27 点），才能进入下一步。
            </div>
          </div>
        )}

        {/* 导航按钮 */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`btn flex items-center gap-2 ${
              currentStep === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'btn-secondary'
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            上一步
          </button>

          {currentStep < STEPS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={isNextDisabled}
              className={`btn flex items-center gap-2 ${
                isNextDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              下一步
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              完成角色
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
