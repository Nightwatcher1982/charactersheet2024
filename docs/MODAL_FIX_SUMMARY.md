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

## 文档
- 统一标准文档：`MODAL_STANDARD.md`
- 本修复总结：`MODAL_FIX_SUMMARY.md`
