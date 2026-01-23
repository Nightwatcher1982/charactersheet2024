// D&D 2024 背景装备包数据

export interface EquipmentItem {
  name: string;
  nameEn: string;
  quantity: number;
  weight?: number;
}

export interface EquipmentPackage {
  items: EquipmentItem[];
  gold: number;
}

export interface BackgroundEquipment {
  backgroundId: string;
  optionA: EquipmentPackage;
  optionB: { gold: number };
}

// 所有背景的装备包
export const BACKGROUND_EQUIPMENT: BackgroundEquipment[] = [
  {
    backgroundId: 'acolyte',
    optionA: {
      items: [
        { name: '书法工具', nameEn: "Calligrapher's Supplies", quantity: 1 },
        { name: '书籍（祈祷书）', nameEn: 'Book (prayers)', quantity: 1 },
        { name: '圣徽', nameEn: 'Holy Symbol', quantity: 1 },
        { name: '羊皮纸', nameEn: 'Parchment', quantity: 10 },
        { name: '长袍', nameEn: 'Robe', quantity: 1 }
      ],
      gold: 8
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'artisan',
    optionA: {
      items: [
        { name: '一种工匠工具', nameEn: "One Artisan's Tools", quantity: 1 },
        { name: '旅行者服装', nameEn: "Traveler's Clothes", quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 1 }
      ],
      gold: 32
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'charlatan',
    optionA: {
      items: [
        { name: '伪造工具', nameEn: "Forgery Kit", quantity: 1 },
        { name: '精致服装', nameEn: 'Fine Clothes', quantity: 1 },
        { name: '印章戒指', nameEn: 'Signet Ring', quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 1 }
      ],
      gold: 15
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'criminal',
    optionA: {
      items: [
        { name: '匕首', nameEn: 'Dagger', quantity: 2 },
        { name: '盗贼工具', nameEn: "Thieves' Tools", quantity: 1 },
        { name: '撬棍', nameEn: 'Crowbar', quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 2 },
        { name: '旅行者服装', nameEn: "Traveler's Clothes", quantity: 1 }
      ],
      gold: 16
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'entertainer',
    optionA: {
      items: [
        { name: '一种乐器', nameEn: 'One Musical Instrument', quantity: 1 },
        { name: '爱慕者的礼物', nameEn: "Favor from an Admirer", quantity: 1 },
        { name: '戏服', nameEn: 'Costume', quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 1 }
      ],
      gold: 11
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'farmer',
    optionA: {
      items: [
        { name: '木匠工具', nameEn: "Carpenter's Tools", quantity: 1 },
        { name: '骡子', nameEn: 'Mule', quantity: 1 },
        { name: '旅行者服装', nameEn: "Traveler's Clothes", quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 1 }
      ],
      gold: 28
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'guard',
    optionA: {
      items: [
        { name: '长矛', nameEn: 'Spear', quantity: 1 },
        { name: '喇叭', nameEn: 'Horn', quantity: 1 },
        { name: '一种游戏套装', nameEn: 'One Gaming Set', quantity: 1 },
        { name: '旅行者服装', nameEn: "Traveler's Clothes", quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 1 }
      ],
      gold: 12
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'guide',
    optionA: {
      items: [
        { name: '制图工具', nameEn: "Cartographer's Tools", quantity: 1 },
        { name: '刺针兽（宠物）', nameEn: 'Quill (pet porcupine)', quantity: 1 },
        { name: '旅行者服装', nameEn: "Traveler's Clothes", quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 1 }
      ],
      gold: 12
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'hermit',
    optionA: {
      items: [
        { name: '草药工具', nameEn: "Herbalism Kit", quantity: 1 },
        { name: '冬毯', nameEn: 'Winter Blanket', quantity: 1 },
        { name: '旅行者服装', nameEn: "Traveler's Clothes", quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 1 }
      ],
      gold: 10
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'merchant',
    optionA: {
      items: [
        { name: '领航工具', nameEn: "Navigator's Tools", quantity: 1 },
        { name: '骡子拉的货车', nameEn: 'Mule and Cart', quantity: 1 },
        { name: '旅行者服装', nameEn: "Traveler's Clothes", quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 1 }
      ],
      gold: 22
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'noble',
    optionA: {
      items: [
        { name: '一种游戏套装', nameEn: 'One Gaming Set', quantity: 1 },
        { name: '印章戒指', nameEn: 'Signet Ring', quantity: 1 },
        { name: '精致服装', nameEn: 'Fine Clothes', quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 1 }
      ],
      gold: 29
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'sage',
    optionA: {
      items: [
        { name: '法杖', nameEn: 'Quarterstaff', quantity: 1 },
        { name: '书法工具', nameEn: "Calligrapher's Supplies", quantity: 1 },
        { name: '书籍（历史）', nameEn: 'Book (history)', quantity: 1 },
        { name: '羊皮纸', nameEn: 'Parchment', quantity: 8 },
        { name: '长袍', nameEn: 'Robe', quantity: 1 }
      ],
      gold: 8
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'sailor',
    optionA: {
      items: [
        { name: '弯刀', nameEn: 'Scimitar', quantity: 1 },
        { name: '领航工具', nameEn: "Navigator's Tools", quantity: 1 },
        { name: '50尺丝绳', nameEn: 'Silk Rope (50 feet)', quantity: 1 },
        { name: '旅行者服装', nameEn: "Traveler's Clothes", quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 1 }
      ],
      gold: 14
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'scribe',
    optionA: {
      items: [
        { name: '书法工具', nameEn: "Calligrapher's Supplies", quantity: 1 },
        { name: '精致钢笔', nameEn: 'Fine Pen', quantity: 1 },
        { name: '羊皮纸', nameEn: 'Parchment', quantity: 10 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 1 },
        { name: '精致服装', nameEn: 'Fine Clothes', quantity: 1 }
      ],
      gold: 23
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'soldier',
    optionA: {
      items: [
        { name: '长矛', nameEn: 'Spear', quantity: 1 },
        { name: '短弓', nameEn: 'Shortbow', quantity: 1 },
        { name: '箭矢', nameEn: 'Arrows', quantity: 20 },
        { name: '一种游戏套装', nameEn: 'One Gaming Set', quantity: 1 },
        { name: '治疗者工具包', nameEn: "Healer's Kit", quantity: 1 },
        { name: '箭袋', nameEn: 'Quiver', quantity: 1 },
        { name: '旅行者服装', nameEn: "Traveler's Clothes", quantity: 1 }
      ],
      gold: 14
    },
    optionB: { gold: 50 }
  },
  {
    backgroundId: 'wayfarer',
    optionA: {
      items: [
        { name: '盗贼工具', nameEn: "Thieves' Tools", quantity: 1 },
        { name: '旅行者服装', nameEn: "Traveler's Clothes", quantity: 1 },
        { name: '钱袋', nameEn: 'Pouch', quantity: 2 }
      ],
      gold: 16
    },
    optionB: { gold: 50 }
  }
];

// 根据背景ID获取装备包
export function getBackgroundEquipment(backgroundId: string): BackgroundEquipment | undefined {
  return BACKGROUND_EQUIPMENT.find(eq => eq.backgroundId === backgroundId);
}

// 获取装备包的总价值（近似）
export function getEquipmentPackageValue(pkg: EquipmentPackage): number {
  // 这是一个简化的计算，实际价值需要查询装备价格表
  return pkg.gold;
}

// 格式化装备列表为显示文本
export function formatEquipmentList(items: EquipmentItem[]): string {
  return items.map(item => {
    if (item.quantity > 1) {
      return `${item.name} x${item.quantity}`;
    }
    return item.name;
  }).join('、');
}

// 获取装备包的完整描述
export function getEquipmentPackageDescription(backgroundId: string, option: 'A' | 'B'): string {
  const equipment = getBackgroundEquipment(backgroundId);
  if (!equipment) return '';
  
  if (option === 'B') {
    return `${equipment.optionB.gold} 金币`;
  }
  
  const itemsList = formatEquipmentList(equipment.optionA.items);
  const gold = equipment.optionA.gold;
  return `${itemsList}${gold > 0 ? `、${gold}金币` : ''}`;
}
