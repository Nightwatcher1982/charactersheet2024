'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterStore } from '@/lib/character-store';
import { ArrowLeft, ArrowRight } from 'lucide-react';

// 步骤组件 - 按照 DND 2024 官方流程
import StepWelcome from '@/components/steps/StepWelcome';
import StepClassSimple from '@/components/steps/StepClassSimple';
import StepOrigin from '@/components/steps/StepOrigin';
import StepAbilities from '@/components/steps/StepAbilities';
import StepAlignment from '@/components/steps/StepAlignment';
import StepSkills from '@/components/steps/StepSkills';
import StepBiography from '@/components/steps/StepBiography';

// 导入新的步骤组件
import StepEquipmentCheck from '@/components/steps/StepEquipmentCheck';
import StepSpellCheck from '@/components/steps/StepSpellCheck';

// 步骤结构 - 传记为最后一步（无单独「确认完成」步骤）
const STEPS = [
  { id: 0, title: '欢迎', shortTitle: '开始', component: StepWelcome },
  { id: 1, title: '选择职业', shortTitle: '职业', component: StepClassSimple },
  { id: 2, title: '确定起源', shortTitle: '起源', component: StepOrigin, hasSubsteps: true },
  { id: 3, title: '确定属性值', shortTitle: '属性', component: StepAbilities },
  { id: 4, title: '选择阵营', shortTitle: '阵营', component: StepAlignment },
  { id: 5, title: '技能检查', shortTitle: '技能检查', component: StepSkills },
  { id: 6, title: '装备检查', shortTitle: '装备检查', component: StepEquipmentCheck },
  { id: 7, title: '法术检查', shortTitle: '法术检查', component: StepSpellCheck },
  { id: 8, title: '传记', shortTitle: '传记', component: StepBiography },
];

export default function CreateCharacterPage() {
  const router = useRouter();
  const { currentCharacter, currentStep, setStep, nextStep, prevStep, saveCharacter, resetWizard, updateCurrentCharacter } = useCharacterStore();
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
    // 步骤1：职业选择 - 只要选了职业就派发，由 StepClassSimple 决定弹窗或进入下一步
    if (currentStep === 1 && currentCharacter?.class) {
      window.dispatchEvent(new CustomEvent('triggerClassConfiguration'));
      return;
    }
    // 步骤2：起源 - 由 StepOrigin 处理（物种配置 / 子步骤 / 进入下一步）
    if (currentStep === 2) {
      window.dispatchEvent(new CustomEvent('triggerOriginNext'));
      return;
    }
    if (currentStep < STEPS.length - 1) {
      nextStep();
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    // 步骤2（起源）：先回到上一子步骤，仅在物种子步骤时才退回步骤1
    if (currentStep === 2) {
      window.dispatchEvent(new CustomEvent('triggerOriginPrev'));
      return;
    }
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
    // 若当前在传记步骤（最后一步），先派发事件让 StepBiography 把未失焦的传记内容写入 store
    if (currentStep === 8) {
      window.dispatchEvent(new CustomEvent('flushBiography'));
    }
    saveCharacter();
    // 保存一份临时数据给网页版角色卡读取（使用 store 最新状态，含刚刷新的传记）
    const char = useCharacterStore.getState().currentCharacter ?? currentCharacter;
    try {
      localStorage.setItem('temp-character-for-sheet', JSON.stringify(char));
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

  // 检查步骤1（职业）是否完成
  const isStep1Complete = currentStep === 1 ? Boolean(
    currentCharacter?.class &&
    currentCharacter?.skills &&
    currentCharacter.skills.length > 0 &&
    currentCharacter?.classStartingEquipment
  ) : true;

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
  // 步骤1：选了职业即可点下一步（点下一步会触发配置弹窗或进入下一步）
  // 步骤2：选了物种即可点下一步（点下一步会触发物种配置弹窗或子步骤/进入下一步）
  const isNextDisabled =
    (currentStep === 1 && !currentCharacter?.class) ||
    (currentStep === 2 && !currentCharacter?.species) ||
    (currentStep === 3 && !isStep3Complete);

  const isWelcomeStep = currentStep === 0;

  return (
    <div className="min-h-screen relative">
      {/* 全屏固定背景层 - 步骤0 用桌案图，其余用原背景 */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: isWelcomeStep ? 'url(/pic/create-welcome-bg.png)' : 'url(/pic/create-page-bg.png)' }}
        aria-hidden
      />
      <div className={`fixed inset-0 z-0 pointer-events-none ${isWelcomeStep ? 'bg-black/15' : 'bg-black/20'}`} aria-hidden />

      {/* 顶部导航 - 步骤0 不显示，整页露背景；其余步骤显示 */}
      {!isWelcomeStep && (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleGoHome}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              返回首页
            </button>

            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              保存进度
            </button>
          </div>

          {/* 横向步骤标签 - 纯文字 + 简单框体 */}
          {currentStep > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {STEPS.map((step, index) => {
                  const isActive = index === currentStep;
                  const isCompleted = index < currentStep;
                  const isAccessible = index <= currentStep;

                  return (
                    <button
                      key={step.id}
                      onClick={() => isAccessible && setStep(index)}
                      disabled={!isAccessible}
                      className={`px-4 py-2 rounded-lg border text-xs whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? 'bg-gray-100 text-gray-900 border-gray-400 font-medium'
                          : isCompleted
                          ? 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          : isAccessible
                          ? 'bg-white text-gray-600 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      {step.shortTitle}
                    </button>
                  );
                })}
              </div>
          )}
        </div>
      </header>
      )}

      {/* 主要内容 - 步骤0 无顶栏故无 pt-40，整页背景；其余步骤预留导航高度 */}
      <div className={`container mx-auto px-4 max-w-4xl relative z-10 min-h-screen flex flex-col ${isWelcomeStep ? 'pt-4 pb-5' : 'py-8 pt-40'}`}>
        {isWelcomeStep ? (
          <>
            <div className="flex-1" />
            <div className="space-y-4 shrink-0">
              <label htmlFor="welcome-name-input" className="block text-sm font-medium text-white drop-shadow-md">
                角色姓名
              </label>
              <input
                id="welcome-name-input"
                type="text"
                value={currentCharacter?.name ?? ''}
                onChange={(e) => updateCurrentCharacter({ name: e.target.value })}
                placeholder="例如：艾瑞克·风行者"
                className="w-full px-4 py-3 bg-white/95 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-gray-900 placeholder:text-gray-500"
                autoComplete="name"
              />
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                开始创建
              </button>
              <div className="pt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>返回首页</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="relative bg-white/90 backdrop-blur-sm border-2 border-gold-dark/40 rounded-3xl p-8 shadow-xl min-h-[500px]">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-amber-200 rounded-full blur-3xl opacity-10" aria-hidden />
            <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-10" aria-hidden />
            <div className="relative z-10">
              <CurrentStepComponent />

              {currentStep === 3 && !isStep3Complete && (
                <div className="mt-6 bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-amber-600 p-5 rounded-r-xl shadow-md">
                  <div className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">⚠️</span>
                    <span>需要先完成属性分配</span>
                  </div>
                  <div className="text-sm text-amber-800">
                    请先在本页完成属性值分配（标准数组需分配完 6 个数值；购点法需花完 27 点），才能进入下一步。
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-10 pt-6 border-t border-gold-light/40">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="group flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 bg-white hover:bg-amber-50 text-leather-dark border-2 border-gold-dark/40 hover:border-gold-dark shadow-md hover:shadow-lg hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  <span>上一步</span>
                </button>

                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className={`group flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                      isNextDisabled
                        ? 'bg-gray-100 text-gray-400 border-2 border-gray-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white border-2 border-purple-800 shadow-lg hover:shadow-xl hover:scale-105'
                    }`}
                  >
                    <span>下一步</span>
                    <ArrowRight className={`w-5 h-5 ${!isNextDisabled && 'group-hover:translate-x-1 transition-transform'}`} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 border-2 border-green-700 rounded-xl font-bold text-white text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <span>完成角色创建</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
