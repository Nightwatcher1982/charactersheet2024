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

**说明：**
- `flex-shrink-0`: **关键**，防止被压缩
- `px-6 py-3`: 内边距
- 背景色可自定义（如 `bg-blue-50`, `bg-purple-50`）

### 5. 内容区域（Content）
```tsx
className="p-6 overflow-y-auto flex-1 min-h-0"
```

**说明：**
- `p-6`: 内边距
- `overflow-y-auto`: 垂直滚动
- `flex-1`: 占据剩余空间
- `min-h-0`: **关键**，允许flex子项收缩，启用内部滚动

### 6. 底部按钮区域（Footer）
```tsx
className="p-4 border-t-2 border-gray-200 bg-white flex gap-3 flex-shrink-0"
```

**说明：**
- `flex-shrink-0`: **关键**，防止被压缩，始终可见
- `p-4`: 内边距
- `border-t-2`: 顶部边框
- `bg-white`: 白色背景
- `flex gap-3`: 横向flex布局，间距

## 完整示例

```tsx
return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col">
      
      {/* 头部 - 固定 */}
      <div className="bg-leather-dark text-white p-4 flex items-center justify-between border-b-2 border-gold-dark flex-shrink-0">
        <h2 className="text-xl font-bold">弹窗标题</h2>
        <button onClick={onClose}>
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* 说明信息 - 固定（可选）*/}
      <div className="px-6 py-3 bg-blue-50 border-b-2 border-blue-100 flex-shrink-0">
        <p className="text-sm text-blue-800">这里是说明文字</p>
      </div>

      {/* 内容区 - 可滚动 */}
      <div className="p-6 overflow-y-auto flex-1 min-h-0">
        {/* 内容 */}
      </div>

      {/* 底部按钮 - 固定 */}
      <div className="p-4 border-t-2 border-gray-200 bg-white flex gap-3 flex-shrink-0">
        <button onClick={onClose} className="...">取消</button>
        <button onClick={handleConfirm} className="...">确认选择</button>
      </div>
      
    </div>
  </div>
);
```

## Body滚动管理

使用 `useEffect` 管理背景页面滚动：

```tsx
useEffect(() => {
  if (isOpen) {
    // 保存当前滚动位置（可选）
    // const scrollY = window.scrollY;
    
    // 禁用body滚动
    document.body.style.overflow = 'hidden';
  } else {
    // 恢复body滚动
    document.body.style.overflow = 'unset';
  }
}, [isOpen]);

// 清理函数
useEffect(() => {
  return () => {
    document.body.style.overflow = 'unset';
  };
}, []);
```

## 常见尺寸

- **小型弹窗**: `max-w-2xl`（如背景能力加值）
- **中型弹窗**: `max-w-3xl`（如技能选择、特性选择）
- **大型弹窗**: `max-w-4xl`（如武器选择、装备选择、法术选择）

## 关键要点

1. **外层容器**: `p-6` + `max-h-[85vh]` 确保弹窗始终在视口内
2. **头部/底部**: `flex-shrink-0` 确保固定不压缩
3. **内容区**: `min-h-0` + `flex-1` + `overflow-y-auto` 确保内部滚动
4. **背景滚动**: `document.body.style.overflow` 管理
5. **垂直居中**: `items-center`（非 `items-start`）

## 已应用组件列表

- ✅ SkillSelectorModal.tsx
- ✅ ClassFeatureSelectorModal.tsx
- ✅ WeaponSelectorModal.tsx
- ✅ ClassEquipmentSelectorModal.tsx
- ✅ SpeciesTraitSelector.tsx
- ✅ UnifiedSelector.tsx
- ✅ SpellSelectorModal.tsx
- ✅ AddSpellModal.tsx
- ✅ StepSpecies.tsx（人类专长弹窗）
- ✅ StepOriginBackground.tsx（背景能力加值、装备、故事弹窗）
- ✅ portraits/page.tsx（图片预览）
