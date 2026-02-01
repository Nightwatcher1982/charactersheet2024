# DND 风格主题与组件规范

本文档定义了项目中DND风格的视觉系统和组件使用规范。

## 1. 色板系统

### 主要色调

#### 羊皮纸色系 (Parchment)
用于背景、卡片等主要内容区域。
```css
parchment-50: #fefce8  /* 最浅 - 主背景 */
parchment-100: #fef9c3 /* 卡片背景 */
parchment-300: #fde047 /* 强调 */
parchment-500: #eab308 /* 默认 */
```

#### 皮革色系 (Leather)
用于边框、文字、装饰元素。
```css
leather-300: #bcac95  /* 边框 */
leather-500: #8b7355  /* 默认 */
leather-700: #5a4a38  /* 文字 */
leather-900: #3f352a  /* 深色文字 */
```

#### 金色系 (Gold)
用于按钮、徽章、强调元素。
```css
gold-500: #f59e0b    /* 默认 */
gold-600: #d97706    /* 按钮 */
gold-700: #b45309    /* 边框 */
```

## 2. 字体系统

### 字体家族

```css
/* 标题字体 - 装饰性衬线 */
font-cinzel: 'Cinzel Decorative', serif

/* 中世纪字体 - 标签使用 */
font-medieval: 'MedievalSharp', cursive

/* 正文字体 - 易读衬线 */
font-default: 'Crimson Text', serif
```

### 使用场景

- **大标题**: `font-cinzel text-3xl font-bold` + `dnd-title` class
- **小标题**: `font-cinzel text-xl font-semibold` + `dnd-subtitle` class
- **标签**: `font-medieval text-sm font-semibold` + `label-dnd` class
- **正文**: 默认字体（Crimson Text）

## 3. 组件样式类

### 卡片组件

#### 标准卡片
```jsx
<div className="card">
  {/* 现代简洁风格 */}
</div>
```

#### DND风格卡片
```jsx
<div className="card-dnd">
  {/* 羊皮纸纹理 + 金色边框效果 */}
</div>
```

### 按钮组件

#### 标准按钮
```jsx
<button className="btn btn-primary">主要操作</button>
<button className="btn btn-secondary">次要操作</button>
<button className="btn btn-outline">轮廓按钮</button>
```

#### DND风格按钮
```jsx
<button className="btn-dnd">
  金色渐变按钮
</button>
```

### 输入框

#### 标准输入
```jsx
<input className="input" />
```

#### DND风格输入
```jsx
<label className="label-dnd">属性名称</label>
<input className="input-dnd" />
```

### 标题组件

```jsx
{/* 章节标题 */}
<h1 className="dnd-title">角色档案</h1>

{/* 子标题 */}
<h2 className="dnd-subtitle">基本信息</h2>

{/* 带下划线的章节标题 */}
<h2 className="section-title-dnd">装备列表</h2>
```

### 信息框

#### 标准信息框
```jsx
<div className="info-box">
  <p>提示信息</p>
</div>
```

#### DND风格信息框
```jsx
<div className="info-box-dnd">
  <p>DND风格提示</p>
</div>
```

### 属性值显示

```jsx
<div className="stat-box-dnd">
  <div className="text-3xl font-bold text-leather-800">18</div>
  <div className="text-sm text-leather-600">力量</div>
</div>
```

### 徽章

```jsx
<span className="badge-dnd">
  等级 5
</span>
```

### 分隔线

```jsx
<div className="divider-dnd"></div>
```

## 4. 阴影系统

```css
shadow-dnd      /* 基础阴影 */
shadow-dnd-lg   /* 中等阴影 */
shadow-dnd-xl   /* 大阴影 */
```

## 5. 布局建议

### 角色档案页面布局

```jsx
<div className="min-h-screen bg-gradient-to-b from-parchment-50 to-parchment-100">
  <div className="container mx-auto px-4 py-8">
    {/* 封面卡片 */}
    <div className="card-dnd mb-6">
      <h1 className="dnd-title">{character.name}</h1>
      <div className="divider-dnd"></div>
      {/* 内容 */}
    </div>

    {/* 功能模块 */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="card-dnd hover:shadow-dnd-xl transition-shadow">
        {/* 模块内容 */}
      </div>
    </div>
  </div>
</div>
```

### 表单页面

```jsx
<form className="space-y-6">
  <div className="card-dnd">
    <h2 className="dnd-subtitle">个人信息</h2>
    
    <div className="space-y-4">
      <div>
        <label className="label-dnd">角色名称</label>
        <input className="input-dnd" type="text" />
      </div>
      
      <div className="divider-dnd"></div>
      
      <button className="btn-dnd w-full">
        保存信息
      </button>
    </div>
  </div>
</form>
```

## 6. 响应式设计

### 移动端优化

- 卡片内边距自动从 `p-6` 减少到 `p-4`
- 标题字号自动缩小
- 多列布局在小屏幕上自动变为单列

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 自动响应布局 */}
</div>
```

## 7. 渐进式应用

### 阶段1：核心页面（已完成）
- 角色档案主页
- 传记页面
- 日志页面
- 高光时刻页面
- 立绘画册页面

### 阶段2：功能页面
- 登录页面 → 添加 DND 风格
- 创建向导 → 逐步添加主题元素

### 阶段3：细节优化
- 添加页面过渡动画
- 优化卡片悬浮效果
- 增强视觉层次

## 8. 打印样式

所有 DND 风格组件在打印时会自动简化：
- 移除背景纹理
- 简化阴影效果
- 保留边框但降低复杂度

## 9. 可访问性

- 所有文字颜色与背景对比度符合 WCAG AA 标准
- 交互元素有清晰的焦点状态
- 按钮和链接有明显的悬浮反馈

## 10. 性能考虑

- 背景纹理使用SVG data URI，无需额外HTTP请求
- 字体使用Google Fonts CDN，支持缓存
- CSS动画使用 `will-change` 优化

## 示例：完整的角色卡片组件

```jsx
<div className="card-dnd">
  <div className="flex items-start gap-4">
    {/* 头像 */}
    <img 
      src={avatar} 
      alt={name}
      className="w-24 h-24 rounded-lg border-2 border-gold-600 shadow-dnd"
    />
    
    {/* 信息 */}
    <div className="flex-1">
      <h1 className="dnd-title mb-2">{name}</h1>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="badge-dnd">{className}</span>
        <span className="badge-dnd">{species}</span>
        <span className="badge-dnd">等级 {level}</span>
      </div>
      
      <div className="divider-dnd"></div>
      
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="stat-box-dnd">
          <div className="text-2xl font-bold text-leather-800">{hp}</div>
          <div className="text-xs text-leather-600">生命值</div>
        </div>
        {/* 更多属性... */}
      </div>
    </div>
  </div>
</div>
```

## 11. 下一步

- [ ] 创建 Storybook 组件文档
- [ ] 添加深色模式支持
- [ ] 创建更多装饰性图标
- [ ] 增加页面过渡动画
