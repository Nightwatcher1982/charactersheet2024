import { create } from 'zustand';
import { Character } from './dnd-data';

const SPECIES_NAME_ALIASES: Record<string, string> = {
  // 统一到 2024 物种中文命名
  魔人: '提夫林',
  巨人裔: '歌利亚',
  半兽人: '兽人',
  半精灵: '精灵',
};

function normalizeSpeciesName(species: unknown): unknown {
  if (typeof species !== 'string') return species;
  return SPECIES_NAME_ALIASES[species] ?? species;
}

function normalizeCharacterSpecies<T extends unknown>(character: T): T {
  if (!character || typeof character !== 'object') return character;
  const c = character as Record<string, unknown>;
  if ('species' in c) {
    c.species = normalizeSpeciesName(c.species);
  }
  return character;
}

// 职业中文名 2024 版统一：邪术师 → 魔契师
const CLASS_NAME_ALIASES: Record<string, string> = {
  邪术师: '魔契师',
  邪术士: '魔契师',
};

function normalizeClassName(class_: unknown): unknown {
  if (typeof class_ !== 'string') return class_;
  return CLASS_NAME_ALIASES[class_] ?? class_;
}

function normalizeCharacterClass<T extends unknown>(character: T): T {
  if (!character || typeof character !== 'object') return character;
  const c = character as Record<string, unknown>;
  if ('class' in c) {
    c.class = normalizeClassName(c.class);
  }
  return character;
}

function generateId(): string {
  // 优先：现代浏览器（含大多数桌面端/新移动端）
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  // 兼容：部分移动端 Safari 只有 getRandomValues
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    // RFC 4122 v4
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  // 最后兜底：极老环境/非安全上下文（不影响功能，只是ID随机性较弱）
  return `id-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
}

interface CharacterStore {
  characters: Character[];
  currentCharacter: Partial<Character> | null;
  currentStep: number;
  
  // Actions
  setCurrentCharacter: (character: Partial<Character>) => void;
  updateCurrentCharacter: (updates: Partial<Character>) => void;
  saveCharacter: () => void;
  loadCharacter: (id: string) => void;
  deleteCharacter: (id: string) => void;
  createNewCharacter: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetWizard: () => void;
}

const createEmptyCharacter = (): Partial<Character> => ({
  id: generateId(),
  name: '',
  class: '',
  species: '',
  background: '',
  level: 1,
  abilityGenerationMethod: 'standard-array',
  abilities: {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  },
  alignment: '',
  hitPoints: 0,
  armorClass: 10,
  skills: [],
  proficiencies: [],
  equipment: [],
  spells: [],
  features: [],
  backstory: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  
  // ⭐ 新增字段初始化
  languages: ['common'], // 默认包含通用语
  feats: [], // 专长列表
  backgroundEquipmentChoice: undefined, // 背景装备选择
  backgroundAbilityBonuses: {}, // 背景属性加值
  classFeatureChoices: {}, // 职业和物种特性选择
  equippedWeapons: [], // 用户选择的武器（武器ID数组）
  
  // ⭐ 角色档案集字段初始化
  biography: {
    appearance: '',
    personality: '',
    relationships: '',
    timeline: []
  },
  journal: [],
  highlights: [],
  portraits: [],
  currentHitPoints: 0,
  temporaryHitPoints: 0,
  hitDiceUsed: 0,
  deathSaves: { successes: 0, failures: 0 },
  conditions: [],
  notes: ''
});

// 仅内存状态，不做本地持久化；角色列表与详情均从服务器拉取
export const useCharacterStore = create<CharacterStore>()((set, get) => ({
      characters: [],
      currentCharacter: null,
      currentStep: 0,

      setCurrentCharacter: (character) => {
        set({ currentCharacter: character });
      },

      updateCurrentCharacter: (updates) => {
        set((state) => ({
          currentCharacter: state.currentCharacter
            ? { ...state.currentCharacter, ...updates, updatedAt: new Date().toISOString() }
            : null,
        }));
      },

      saveCharacter: () => {
        const { currentCharacter, characters } = get();
        if (!currentCharacter || !currentCharacter.id) return;

        const existingIndex = characters.findIndex((c) => c.id === currentCharacter.id);
        
        if (existingIndex >= 0) {
          // 更新现有角色
          const updatedCharacters = [...characters];
          updatedCharacters[existingIndex] = currentCharacter as Character;
          set({ characters: updatedCharacters });
        } else {
          // 添加新角色
          set({ characters: [...characters, currentCharacter as Character] });
        }
      },

      loadCharacter: (id) => {
        const character = get().characters.find((c) => c.id === id);
        if (character) {
          set({ currentCharacter: character, currentStep: 0 });
        }
      },

      deleteCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
        }));
      },

      createNewCharacter: () => {
        set({
          currentCharacter: createEmptyCharacter(),
          currentStep: 0,
        });
      },

      setStep: (step) => {
        set({ currentStep: step });
      },

      nextStep: () => {
        set((state) => ({ currentStep: state.currentStep + 1 }));
      },

      prevStep: () => {
        set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) }));
      },

      resetWizard: () => {
        set({
          currentCharacter: null,
          currentStep: 0,
        });
      },
}));
