# 统一弹窗CSS样式标准

## 设计原则
- 弹窗居中显示，圆角边框
- 外层遮罩半透明黑色背景
- 内容区可滚动，头部和底部固定
- 确认和取消按钮始终可见

## 标准结构

### 1. 外层遮罩容器（Modal Overlay）
```tsx
className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
```

**说明：**
- `fixed inset-0`: 固定定位，覆盖整个视口
- `z-50`: 高层级，确保在其他内容之上
- `flex items-center justify-center`: 垂直水平居中
- `bg-black/50`: 半透明黑色背景
- `p-6`: 外边距 1.5rem，确保弹窗不贴边

### 2. 内层卡片容器（Modal Card）
```tsx
className="bg-white rounded-xl shadow-2xl max-w-[SIZE] w-full max-h-[85vh] flex flex-col"
```

**说明：**
- `bg-white`: 白色背景
- `rounded-xl`: 圆角边框
- `shadow-2xl`: 深阴影
- `max-w-[SIZE]`: 最大宽度（根据内容调整：2xl, 3xl, 4xl）
- `w-full`: 宽度100%，在最大宽度内
- `max-h-[85vh]`: 最大高度85%视口，确保始终在屏幕内
- `flex flex-col`: 纵向flex布局

### 3. 头部区域（Header）
```tsx
className="[THEME] p-4 flex items-center justify-between border-b-2 [BORDER] flex-shrink-0"
```

**说明：**
- `flex-shrink-0`: **关键**，防止被压缩
- `p-4`: 内边距
- `border-b-2`: 底部边框
- 主题色可根据类型自定义（如 `bg-leather-dark text-white`）

### 4. 说明/提示区域（Info Bar）- 可选
```tsx
className="px-6 py-3 [BG_COLOR] border-b-2 [BORDER_COLOR] flex-shrink-0"
```

### 5. 内容区域（Content）
```tsx
className="p-6 overflow-y-auto flex-1 min-h-0"
```

**说明：**
- `min-h-0`: **关键**，允许flex子项收缩，启用内部滚动

### 6. 底部按钮区域（Footer）
```tsx
className="p-4 border-t-2 border-gray-200 bg-white flex gap-3 flex-shrink-0"
```

## 常见尺寸
- **小型弹窗**: `max-w-2xl`
- **中型弹窗**: `max-w-3xl`
- **大型弹窗**: `max-w-4xl`

## 已应用组件列表
- SkillSelectorModal, ClassFeatureSelectorModal, WeaponSelectorModal, ClassEquipmentSelectorModal
- SpeciesTraitSelector, UnifiedSelector, SpellSelectorModal, AddSpellModal
- StepSpecies, StepOriginBackground, portraits/page.tsx
