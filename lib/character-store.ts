import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character, Ability } from './dnd-data';

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
  id: crypto.randomUUID(),
  name: '',
  class: '',
  species: '',
  background: '',
  level: 1,
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
  classFeatureChoices: {} // 职业和物种特性选择
});

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'dnd-character-storage',
    }
  )
);
