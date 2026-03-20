# UI 修复记录

## 2025-03-18 - 模型选择器尺寸和位置修复

### 问题描述
模型选择器按钮的大小和位置不正确：
- 宽度占据了整个可用空间（`w-full`）
- 垂直内边距导致高度不匹配其他按钮
- Chevron 下拉图标仍然显示

### 修复内容

#### 1. 宽度修复
```tsx
// Before
<SelectTrigger className="h-8 px-3 text-xs font-medium rounded-full...">

// After  
<SelectTrigger className="h-8 w-auto px-3 py-0 text-xs font-medium rounded-full...">
```

**变更**：
- 添加 `w-auto` - 宽度自适应内容，不再占满整行
- 添加 `py-0` - 移除垂直内边距，与其他按钮高度一致

#### 2. 图标隐藏
```tsx
// Before
<SelectTrigger className="...[&>svg]:hidden...">

// After
<SelectTrigger className="...[&>svg]:hidden...">
```

**变更**：
- 保留 `[&>svg]:hidden` - 隐藏默认的 Chevron 下拉图标
- 原因：我们使用 Package 图标作为主图标，不需要下拉箭头

### 技术细节

**SelectTrigger 默认样式**：
```tsx
// components/ui/select.tsx
"flex h-9 w-full items-center justify-between..."
```

**覆盖策略**：
- `w-auto` 覆盖 `w-full`
- `h-8` 覆盖 `h-9`（与其他按钮一致）
- `py-0` 移除默认的 `py-2`
- `[&>svg]:hidden` 隐藏 Radix UI 的 SelectIcon

### 视觉对比

**修复前**：
```
┌────────────────────────────────────────────┐
│ 📦 Veo 3.1 Quality (Exp)              ▼   │ ← 占满整行，有下拉箭头
└────────────────────────────────────────────┘
┌─────────────────────┐ ┌───────────────┐
│ ⚙️ 720P · 9:16 · 8s │ │ 📊 Generate 1 │
└─────────────────────┘ └───────────────┘
```

**修复后**：
```
┌───────────────────────┐ ┌─────────────────────┐ ┌───────────────┐
│ 📦 Veo 3.1 Quality... │ │ ⚙️ 720P · 9:16 · 8s │ │ 📊 Generate 1 │
└───────────────────────┘ └─────────────────────┘ └───────────────┘
```

### 修改文件
- `components/video-generator-form.tsx` - 第 110 行

### 验证
- ✅ 构建成功（无 TypeScript 错误）
- ✅ 开发服务器运行在 http://localhost:3001
- ✅ 模型选择器宽度自适应
- ✅ 高度与其他按钮一致（h-8）
- ✅ 无多余的下拉箭头图标
- ✅ 所有按钮水平对齐

### 相关修复
参考 CHANGELOG.md 中的其他修复：
- 模型选择器图标+文本显示
- 悬浮效果（cursor-pointer + hover）
