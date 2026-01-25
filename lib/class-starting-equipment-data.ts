// D&D 2024 职业起始装备数据

export interface ClassStartingEquipmentOption {
  id: string;
  name: string;
  description?: string;
  items: string[]; // 装备名称列表
  weapons?: string[]; // 武器ID列表
  armor?: string[]; // 护甲名称列表
  gold?: number; // 该选项包含的金币（GP）
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
        items: ['巨斧', '手斧×4', '探险者套组'],
        weapons: ['greataxe', 'handaxe'],
        gold: 15,
      },
      {
        id: 'option2',
        name: '选项B',
        items: [],
        weapons: [],
        gold: 75,
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
        items: ['匕首×2', '乐器（任意）', '艺人套组'],
        weapons: ['dagger'],
        armor: ['皮甲'],
        gold: 19,
      },
      {
        id: 'option2',
        name: '选项B',
        items: [],
        weapons: [],
        armor: [],
        gold: 90,
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
        items: ['钉头锤', '圣徽', '祭司套组'],
        weapons: ['mace'],
        armor: ['链甲衫', '盾牌'],
        gold: 7,
      },
      {
        id: 'option2',
        name: '选项B',
        weapons: [],
        armor: [],
        items: [],
        gold: 110,
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
        items: ['镰刀', '长棍（德鲁伊法器）', '探险者套组', '草药师工具'],
        weapons: ['sickle', 'quarterstaff'],
        armor: ['皮甲', '盾牌'],
        gold: 9,
      },
      {
        id: 'option2',
        name: '选项B',
        weapons: [],
        armor: [],
        items: [],
        gold: 50,
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
        items: ['巨剑', '链枷', '标枪×8', '地城探险者套组'],
        weapons: ['greatsword', 'flail', 'javelin'],
        armor: ['链甲'],
        gold: 4,
      },
      {
        id: 'option2',
        name: '选项B',
        items: ['弯刀', '短剑', '长弓', '箭矢×20', '箭袋', '地城探险者套组'],
        weapons: ['scimitar', 'shortsword', 'longbow'],
        armor: ['镶钉皮甲'],
        gold: 11,
      },
      {
        id: 'option3',
        name: '选项C',
        items: [],
        weapons: [],
        armor: [],
        gold: 155,
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
        items: ['长矛', '匕首×5', '工匠工具或乐器（与你的熟练一致）', '探险者套组'],
        weapons: ['spear', 'dagger'],
        gold: 11,
      },
      {
        id: 'option2',
        name: '选项B',
        items: [],
        weapons: [],
        gold: 50,
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
        items: ['长剑', '标枪×6', '圣徽', '祭司套组'],
        weapons: ['longsword', 'javelin'],
        armor: ['链甲', '盾牌'],
        gold: 9,
      },
      {
        id: 'option2',
        name: '选项B',
        items: [],
        weapons: [],
        armor: [],
        gold: 150,
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
        items: ['弯刀', '短剑', '长弓', '箭矢×20', '箭袋', '德鲁伊法器（槲寄生枝）', '探险者套组'],
        weapons: ['scimitar', 'shortsword', 'longbow'],
        armor: ['镶钉皮甲'],
        gold: 7,
      },
      {
        id: 'option2',
        name: '选项B',
        items: [],
        weapons: [],
        armor: [],
        gold: 150,
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
        items: ['匕首×2', '短剑', '短弓', '箭矢×20', '箭袋', '盗贼工具', '盗贼套组'],
        weapons: ['dagger', 'shortsword', 'shortbow'],
        armor: ['皮甲'],
        gold: 8,
      },
      {
        id: 'option2',
        name: '选项B',
        items: [],
        weapons: [],
        armor: [],
        gold: 100,
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
        items: ['长矛', '匕首×2', '奥术法器（水晶）', '地城探险者套组'],
        weapons: ['spear', 'dagger'],
        gold: 28,
      },
      {
        id: 'option2',
        name: '选项B',
        weapons: [],
        armor: [],
        items: [],
        gold: 50,
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
        items: ['镰刀', '匕首×2', '奥术法器（宝珠）', '书（神秘学知识）', '学者套组'],
        weapons: ['sickle', 'dagger'],
        armor: ['皮甲'],
        gold: 15,
      },
      {
        id: 'option2',
        name: '选项B',
        weapons: [],
        armor: [],
        items: [],
        gold: 100,
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
        items: ['匕首×2', '长棍（奥术法器）', '长袍', '法术书', '学者套组'],
        weapons: ['dagger', 'quarterstaff'],
        gold: 5,
      },
      {
        id: 'option2',
        name: '选项B',
        weapons: [],
        armor: [],
        items: [],
        gold: 55,
      },
    ],
  },
];

// 根据职业ID获取起始装备选项
export function getClassStartingEquipment(classId: string): ClassStartingEquipment | undefined {
  return CLASS_STARTING_EQUIPMENT.find(eq => eq.classId === classId);
}
