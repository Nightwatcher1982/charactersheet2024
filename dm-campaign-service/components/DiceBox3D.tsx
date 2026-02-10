'use client';

import { useEffect, useRef, useState } from 'react';

const CONTAINER_ID = 'dice-box-3d-container';

export type DiceTrigger = {
  rolls: number[];
  formula: string;
  /** 复合公式时各段（如 2d6、2d10）及其对应的点数，用于生成多段记号 */
  parts?: { formula: string; rolls: number[] }[];
};

/**
 * 从公式字符串解析出骰子面数，用于构建预定结果记号
 */
function getSidesFromFormula(formula: string): number {
  const m = formula.match(/d(\d+)/i);
  return m ? parseInt(m[1], 10) : 6;
}

/**
 * 构建单段预定结果记号，如 "2d6@3,5"
 */
function buildPartNotation(part: { formula: string; rolls: number[] }): string {
  if (!part.rolls.length) return '';
  const sides = getSidesFromFormula(part.formula);
  return `${part.rolls.length}d${sides}@${part.rolls.join(',')}`;
}

/**
 * 有 parts 时返回多段记号数组（用于先 roll 第一段再 add 其余段）；否则返回单段字符串
 */
export function buildPredeterminedNotation(
  rolls: number[],
  formula: string,
  parts?: { formula: string; rolls: number[] }[]
): string | string[] {
  if (!rolls.length) return '';
  if (parts && parts.length > 0) {
    const segs = parts.map(buildPartNotation).filter(Boolean);
    return segs.length > 0 ? segs : `${rolls.length}d${getSidesFromFormula(formula)}@${rolls.join(',')}`;
  }
  const sides = getSidesFromFormula(formula);
  return `${rolls.length}d${sides}@${rolls.join(',')}`;
}

type DiceBox3DProps = {
  /** 当设置时触发一次 3D 掷骰动画（使用 API 返回的 rolls 与 formula） */
  trigger: DiceTrigger | null;
  /** 动画结束回调 */
  onRollComplete?: () => void;
  /** 点击关闭全屏骰子时回调（由父组件收起骰子区域） */
  onClose?: () => void;
};

type DiceBoxInstance = {
  roll: (notation: string) => Promise<unknown>;
  add: (notation: string) => Promise<unknown>;
};

function runRoll(
  box: DiceBoxInstance,
  notation: string | string[],
  onDone?: () => void
): void {
  if (typeof notation === 'string') {
    box.roll(notation).catch((err: unknown) => console.error('DiceBox roll:', err));
    return;
  }
  if (!Array.isArray(notation) || notation.length === 0) return;
  const run = async () => {
    try {
      await box.roll(notation[0]);
      for (let i = 1; i < notation.length; i++) {
        await box.add(notation[i]);
      }
      onDone?.();
    } catch (err) {
      console.error('DiceBox roll/add:', err);
    }
  };
  run();
}

export default function DiceBox3D({ trigger, onRollComplete, onClose }: DiceBox3DProps) {
  const boxRef = useRef<DiceBoxInstance | null>(null);
  const lastNotationRef = useRef<string | string[] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  const triggerRef = useRef<DiceTrigger | null>(null);
  triggerRef.current = trigger;

  useEffect(() => {
    let mounted = true;
    const el = document.getElementById(CONTAINER_ID);
    if (!el) return;

    import('@3d-dice/dice-box-threejs').then(async (mod) => {
      if (!mounted) return;
      const DiceBox = mod.default;
      try {
        const box = new DiceBox(`#${CONTAINER_ID}`, {
          sounds: true,
          volume: 80,
          shadows: true,
          theme_surface: 'green-felt',
          theme_colorset: 'swa_blue',
          theme_material: 'plastic',
          assetPath: '/dice-assets/',
          onRollComplete: () => {
            onRollComplete?.();
          },
        });
        await box.initialize();
        if (!mounted) return;
        const b = box as DiceBoxInstance & { scene?: { background: unknown }; desk?: { visible: boolean; material?: { opacity: number } } };
        if (b.scene) b.scene.background = null;
        if (b.desk) {
          b.desk.visible = false;
          if (b.desk.material) b.desk.material.opacity = 0;
        }
        boxRef.current = box as DiceBoxInstance;
        setReady(true);
        const pending = triggerRef.current;
        if (pending) {
          const notation = buildPredeterminedNotation(
            pending.rolls,
            pending.formula,
            pending.parts
          );
          const key = Array.isArray(notation) ? notation.join('|') : notation;
          if (notation && key !== (lastNotationRef.current ? (Array.isArray(lastNotationRef.current) ? lastNotationRef.current.join('|') : lastNotationRef.current) : '')) {
            lastNotationRef.current = notation;
            runRoll(box as DiceBoxInstance, notation, onRollComplete);
          }
        }
      } catch (err) {
        console.error('DiceBox init:', err);
      }
    });

    return () => {
      mounted = false;
      boxRef.current = null;
      setReady(false);
    };
  }, [onRollComplete]);

  useEffect(() => {
    if (!trigger || !boxRef.current) return;

    const notation = buildPredeterminedNotation(
      trigger.rolls,
      trigger.formula,
      trigger.parts
    );
    const key = Array.isArray(notation) ? notation.join('|') : notation;
    if (!notation || key === (lastNotationRef.current ? (Array.isArray(lastNotationRef.current) ? lastNotationRef.current.join('|') : lastNotationRef.current) : '')) return;
    lastNotationRef.current = notation;

    runRoll(boxRef.current, notation, onRollComplete);
  }, [trigger, onRollComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 bg-transparent"
      aria-label="骰子投掷"
    >
      <div
        id={CONTAINER_ID}
        className="w-full h-full overflow-hidden"
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-30">
          <span className="px-4 py-2 rounded bg-white/95 text-gray-800 text-sm shadow">准备骰子…</span>
        </div>
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-50 px-3 py-1.5 text-sm border border-gray-300 rounded bg-white/90 hover:bg-gray-100 text-gray-700 shadow"
        >
          关闭
        </button>
      )}
    </div>
  );
}
