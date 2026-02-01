'use client';

import { useState, useEffect } from 'react';
import { X, Check, Wand2 } from 'lucide-react';
import { getMagicInitiateSpellList, getFeatById } from '@/lib/feats-data';
import { getSpellsByClass } from '@/lib/spells-data';

const ABILITY_OPTIONS: { value: string; label: string }[] = [
  { value: '智力', label: '智力' },
  { value: '感知', label: '感知' },
  { value: '魅力', label: '魅力' },
];

export interface MagicInitiateChoice {
  cantrips: string[];
  spell: string;
  ability: string;
}

interface MagicInitiateSpellModalProps {
  isOpen: boolean;
  onClose: () => void;
  featId: string; // magic-initiate-cleric | magic-initiate-druid | magic-initiate-wizard
  onComplete: (choice: MagicInitiateChoice) => void;
  initialCantrips?: string[];
  initialSpell?: string;
  initialAbility?: string;
}

type Step = 'cantrips' | 'spell' | 'ability';

export default function MagicInitiateSpellModal({
  isOpen,
  onClose,
  featId,
  onComplete,
  initialCantrips = [],
  initialSpell = '',
  initialAbility = '',
}: MagicInitiateSpellModalProps) {
  const [step, setStep] = useState<Step>('cantrips');
  const [cantrips, setCantrips] = useState<string[]>(initialCantrips);
  const [spell, setSpell] = useState<string>(initialSpell);
  const [ability, setAbility] = useState<string>(initialAbility);

  const listName = getMagicInitiateSpellList(featId);
  const feat = getFeatById(featId);
  const listLabel = listName === '牧师' ? '牧师' : listName === '德鲁伊' ? '德鲁伊' : '法师';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep('cantrips');
      setCantrips(initialCantrips);
      setSpell(initialSpell);
      setAbility(initialAbility || (listName === '法师' ? '智力' : '感知'));
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, featId]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!isOpen || !listName || !feat) return null;

  const { cantrips: availableCantrips, level1: availableLevel1 } = getSpellsByClass(listName);

  const toggleCantrip = (id: string) => {
    setCantrips((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev
    );
  };

  const canProceedCantrips = cantrips.length === 2;
  const canComplete = step === 'ability' && ability;

  const handleConfirm = () => {
    if (step === 'cantrips' && canProceedCantrips) {
      setStep('spell');
      return;
    }
    if (step === 'spell' && spell) {
      setStep('ability');
      if (!ability) setAbility(listName === '法师' ? '智力' : '感知');
      return;
    }
    if (step === 'ability' && ability) {
      onComplete({ cantrips, spell, ability });
      onClose();
    }
  };

  const handleBack = () => {
    if (step === 'spell') setStep('cantrips');
    else if (step === 'ability') setStep('spell');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-6">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b-2 border-purple-200 flex-shrink-0 bg-purple-50">
          <div className="flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">
              {feat.name} -{' '}
              {step === 'cantrips' ? '选择两道戏法' : step === 'spell' ? '选择一环法术' : '选择施法属性'}
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-4 py-2 bg-purple-50/50 border-b border-purple-100 flex-shrink-0 text-sm text-gray-700">
          {step === 'cantrips' && (
            <p>
              从<strong>{listLabel}</strong>法术列表中选择 <strong className="text-purple-600">2</strong> 道戏法。已选：{cantrips.length} / 2
            </p>
          )}
          {step === 'spell' && (
            <p>
              从<strong>{listLabel}</strong>法术列表中选择 <strong className="text-purple-600">1</strong> 道一环法术（始终准备，每长休可无偿施放一次）。
            </p>
          )}
          {step === 'ability' && (
            <p>
              本专长习得的法术使用所选属性作为施法属性。
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 p-4">
          {step === 'cantrips' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableCantrips.map((s) => {
                const isSelected = cantrips.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleCantrip(s.id)}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{s.name}</span>
                      {isSelected && <Check className="w-5 h-5 text-purple-600" />}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{s.school} · {s.castingTime}</p>
                  </button>
                );
              })}
            </div>
          )}

          {step === 'spell' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableLevel1.map((s) => {
                const isSelected = spell === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSpell(s.id)}
                    className={`text-left p-3 rounded-lg border-2 transition-all ${
                      isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{s.name}</span>
                      {isSelected && <Check className="w-5 h-5 text-purple-600" />}
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{s.school} · {s.castingTime}</p>
                  </button>
                );
              })}
            </div>
          )}

          {step === 'ability' && (
            <div className="flex flex-wrap gap-3">
              {ABILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setAbility(opt.value)}
                  className={`px-6 py-3 rounded-lg border-2 font-medium transition-all ${
                    ability === opt.value ? 'border-purple-500 bg-purple-50 text-purple-900' : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-2 p-4 border-t-2 border-gray-100 flex-shrink-0">
          <div>
            {step !== 'cantrips' && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
              >
                上一步
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={
              (step === 'cantrips' && !canProceedCantrips) ||
              (step === 'spell' && !spell) ||
              (step === 'ability' && !ability)
            }
            className={`px-4 py-2 rounded-lg font-medium ${
              (step === 'cantrips' && canProceedCantrips) || (step === 'spell' && spell) || (step === 'ability' && ability)
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {step === 'ability' ? '确认' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  );
}
