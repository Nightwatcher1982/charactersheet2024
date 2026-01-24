// D&D 2024 职业起始装备数据

export interface ClassStartingEquipmentOption {
  id: string;
  name: string;
  description?: string;
  items: string[]; // 装备名称列表
  weapons?: string[]; // 武器ID列表
  armor?: string[]; // 护甲名称列表
}

export interface ClassStartingEquipment {
  classId: string;
  options: ClassStartingEquipmentOption[];
}

// 职业起始装备选项
export const CLASS_STARTING_EQUIPMENT: ClassStartingEquipment[] = [
  // 野蛮人
  {
    classId: 'barbarian',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['巨斧', '手斧', '探险者套装'],
        weapons: ['greataxe', 'handaxe'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['军用武器（任意）', '手斧', '探险者套装'],
        weapons: ['handaxe'],
      },
    ],
  },
  // 吟游诗人
  {
    classId: 'bard',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['细剑', '长弓', '20支箭', '背包', '乐器（任意）', '皮甲'],
        weapons: ['rapier', 'longbow'],
        armor: ['皮甲'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['简易武器（任意）', '手弩', '20支弩矢', '背包', '乐器（任意）', '皮甲'],
        weapons: ['hand-crossbow'],
        armor: ['皮甲'],
      },
    ],
  },
  // 牧师
  {
    classId: 'cleric',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['钉头锤', '盾牌', '圣徽', '背包', '链甲衫'],
        weapons: ['mace'],
        armor: ['链甲衫', '盾牌'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['简易武器（任意）', '圣徽', '背包', '鳞甲'],
        weapons: [],
        armor: ['鳞甲'],
      },
    ],
  },
  // 德鲁伊
  {
    classId: 'druid',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['木盾', '木棒', '匕首', '背包', '兽皮甲'],
        weapons: ['club', 'dagger'],
        armor: ['兽皮甲', '盾牌'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['简易武器（任意）', '背包', '兽皮甲'],
        weapons: [],
        armor: ['兽皮甲'],
      },
    ],
  },
  // 战士
  {
    classId: 'fighter',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['链甲', '盾牌', '长剑', '手斧', '轻弩', '20支弩矢'],
        weapons: ['longsword', 'handaxe', 'light-crossbow'],
        armor: ['链甲', '盾牌'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['链甲', '军用武器（任意）', '盾牌', '手斧', '轻弩', '20支弩矢'],
        weapons: ['handaxe', 'light-crossbow'],
        armor: ['链甲', '盾牌'],
      },
      {
        id: 'option3',
        name: '选项C',
        items: ['鳞甲', '长弓', '20支箭', '手斧'],
        weapons: ['longbow', 'handaxe'],
        armor: ['鳞甲'],
      },
    ],
  },
  // 武僧
  {
    classId: 'monk',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['短剑', '探险者套装'],
        weapons: ['shortsword'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['简易武器（任意）', '飞镖（10支）', '探险者套装'],
        weapons: ['dart'],
      },
    ],
  },
  // 圣武士
  {
    classId: 'paladin',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['链甲', '盾牌', '长剑', '手斧', '圣徽', '探险者套装'],
        weapons: ['longsword', 'handaxe'],
        armor: ['链甲', '盾牌'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['链甲', '军用武器（任意）', '盾牌', '手斧', '圣徽', '探险者套装'],
        weapons: ['handaxe'],
        armor: ['链甲', '盾牌'],
      },
    ],
  },
  // 游侠
  {
    classId: 'ranger',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['鳞甲', '短剑', '短剑', '长弓', '20支箭', '背包', '箭袋'],
        weapons: ['shortsword', 'shortsword', 'shortbow'],
        armor: ['鳞甲'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['鳞甲', '简易武器（任意）', '短剑', '长弓', '20支箭', '背包', '箭袋'],
        weapons: ['shortsword', 'shortbow'],
        armor: ['鳞甲'],
      },
    ],
  },
  // 游荡者
  {
    classId: 'rogue',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['细剑', '短弓', '20支箭', '背包', '盗贼工具', '皮甲'],
        weapons: ['rapier', 'shortbow'],
        armor: ['皮甲'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['短剑', '短剑', '背包', '盗贼工具', '皮甲'],
        weapons: ['shortsword', 'shortsword'],
        armor: ['皮甲'],
      },
    ],
  },
  // 术士
  {
    classId: 'sorcerer',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['轻弩', '20支弩矢', '组件袋', '背包', '木棒'],
        weapons: ['light-crossbow', 'club'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['简易武器（任意）', '组件袋', '背包', '奥术法器'],
        weapons: [],
      },
    ],
  },
  // 邪术师
  {
    classId: 'warlock',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['轻弩', '20支弩矢', '组件袋', '背包', '木棒'],
        weapons: ['light-crossbow', 'club'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['简易武器（任意）', '组件袋', '背包', '奥术法器'],
        weapons: [],
      },
    ],
  },
  // 法师
  {
    classId: 'wizard',
    options: [
      {
        id: 'option1',
        name: '选项A',
        items: ['轻弩', '20支弩矢', '组件袋', '背包', '木棍'],
        weapons: ['light-crossbow', 'quarterstaff'],
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['简易武器（任意）', '组件袋', '背包', '奥术法器'],
        weapons: [],
      },
    ],
  },
];

// 根据职业ID获取起始装备选项
export function getClassStartingEquipment(classId: string): ClassStartingEquipment | undefined {
  return CLASS_STARTING_EQUIPMENT.find(eq => eq.classId === classId);
}
