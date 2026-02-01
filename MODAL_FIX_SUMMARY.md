# 弹窗样式统一修复总结

## 问题描述

用户反馈弹窗存在以下问题：
1. 两个滚动条（一个在弹窗内，一个在背景页）
2. 灰色背景边框
3. 弹窗内容滚轮被锁定
4. 底部"确认选择"和"取消"按钮不可见

## 根本原因

经过多次修改后，弹窗的 CSS 样式产生了冲突和重叠：
- 外层容器使用了 `p-4 pt-8` 和 `overflow-hidden`，但内层高度为 `h-[calc(100vh-2rem)]`，导致内层超出外层
- 缺少合适的 flex 布局约束，导致头部和底部可能被压缩
- 高度计算不准确，导致按钮被裁切

## 解决方案

### 统一CSS标准

制定并应用了统一的弹窗CSS样式标准（详见 `MODAL_STANDARD.md`）：

**外层遮罩**：
```tsx
className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
```
- 改为 `p-6`（统一边距）
- 改为 `items-center`（垂直居中）
- 移除 `overflow-hidden`（不需要）

**内层卡片**：
```tsx
className="bg-white rounded-xl shadow-2xl max-w-[SIZE] w-full max-h-[85vh] flex flex-col"
```
- 改为 `max-h-[85vh]`（替代之前的 `h-[calc(100vh-2rem)]`）
- 移除固定高度，只保留最大高度
- 移除 `overflow-hidden`（由内部区域控制）

**头部/说明/底部**：
```tsx
className="... flex-shrink-0"
```
- 关键：添加 `flex-shrink-0`，防止被压缩

**内容区**：
```tsx
className="p-6 overflow-y-auto flex-1 min-h-0"
```
- 关键：`min-h-0` 允许 flex 子项收缩
- `flex-1` 占据剩余空间
- `overflow-y-auto` 启用内部滚动

## 修改的文件

### Modal 组件（8个）
1. ✅ `components/SkillSelectorModal.tsx`
2. ✅ `components/ClassFeatureSelectorModal.tsx`
3. ✅ `components/WeaponSelectorModal.tsx`
4. ✅ `components/ClassEquipmentSelectorModal.tsx`
5. ✅ `components/SpeciesTraitSelector.tsx`
6. ✅ `components/UnifiedSelector.tsx`
7. ✅ `components/SpellSelectorModal.tsx`
8. ✅ `components/character-sheet/AddSpellModal.tsx`

### 内嵌弹窗（3个步骤页面）
9. ✅ `components/steps/StepSpecies.tsx`（人类专长弹窗）
10. ✅ `components/steps/StepOriginBackground.tsx`（3个弹窗：背景能力加值、装备选择、背景故事）

### 其他
11. ✅ `app/characters/[id]/portraits/page.tsx`（图片预览）

## 关键修改点

### 1. 外层容器
**之前**：
```tsx
className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-hidden"
```

**之后**：
```tsx
className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
```

### 2. 内层卡片
**之前**：
```tsx
className="bg-white rounded-xl shadow-2xl max-w-3xl w-full h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col"
```

**之后**：
```tsx
className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col"
```

### 3. 头部/底部
**确保添加**：
```tsx
flex-shrink-0
```

### 4. 内容区
**确保保留**：
```tsx
min-h-0
```

## 测试验证清单

### 基础功能
- [ ] 弹窗能够正常打开和关闭
- [ ] 弹窗垂直水平居中显示
- [ ] 弹窗有圆角边框
- [ ] 背景遮罩为半透明黑色

### 滚动行为
- [ ] 弹窗打开时，背景页面无法滚动
- [ ] 弹窗内容区可以正常滚动
- [ ] 只有一个滚动条（在弹窗内容区）
- [ ] 关闭弹窗后，背景页面恢复滚动

### 布局显示
- [ ] 头部固定显示，不会被滚动隐藏
- [ ] 底部按钮固定显示，始终可见
- [ ] 内容过长时，内容区出现滚动条
- [ ] 内容较短时，弹窗高度自适应

### 按钮交互
- [ ] "确认选择"按钮始终可见且可点击
- [ ] "取消"按钮始终可见且可点击
- [ ] 按钮样式统一，间距合理

### 各类弹窗测试
- [ ] 技能选择弹窗（职业技能、背景技能）
- [ ] 特性选择弹窗（职业特性、物种特性）
- [ ] 装备选择弹窗（武器、护甲、物品）
- [ ] 法术选择弹窗（戏法、一环法术）
- [ ] 背景信息弹窗
- [ ] 专长选择弹窗
- [ ] 能力加值分配弹窗

## 预期效果

1. **单一滚动条**：弹窗打开后，只有弹窗内容区有滚动条，背景页面不滚动
2. **透明背景**：弹窗背景为半透明黑色遮罩，无灰色边框
3. **按钮可见**：无论内容多长，底部按钮始终固定在弹窗底部，始终可见可点击
4. **内容可滚**：内容过长时，中间内容区可以滚动查看所有选项
5. **居中显示**：弹窗始终垂直水平居中，不会贴边或超出视口

## 技术细节

### Flexbox 布局关键
```
外层 (max-h-[85vh])
├─ 头部 (flex-shrink-0) ← 固定高度
├─ 说明 (flex-shrink-0) ← 固定高度
├─ 内容 (flex-1 min-h-0 overflow-y-auto) ← 可伸缩+滚动
└─ 底部 (flex-shrink-0) ← 固定高度
```

`min-h-0` 的作用：默认情况下，flex 子项的 `min-height: auto`，会导致子项不能小于其内容高度。设置 `min-h-0` 后，允许子项收缩到小于内容高度，从而触发 `overflow-y-auto`。

### 高度计算
- `max-h-[85vh]`：最大高度为视口高度的 85%
- `p-6`：外层边距 1.5rem（24px）
- 实际可用高度：85vh = 约 700px（在 1080p 显示器上）
- 留出空间给头部、说明、底部后，内容区自动计算剩余高度

## 文档
- 统一标准文档：`MODAL_STANDARD.md`
- 本修复总结：`MODAL_FIX_SUMMARY.md`
