# Popover 修复 - 正确的弹窗效果

## 2025-03-18 - 使用 Popover 替代 Dialog

### 问题
之前使用了 Dialog（对话框）组件，导致：
- ❌ 弹窗居中显示在屏幕中央
- ❌ 有全屏半透明遮罩
- ❌ 弹窗太大，不符合原网站风格

### 解决方案
使用 Popover（弹出框）组件：
- ✅ 从按钮旁边弹出小面板
- ✅ 无全屏遮罩
- ✅ 点击外部自动关闭
- ✅ 尺寸适中，更贴近原网站

### 实现对比

#### 错误实现（Dialog）
```tsx
<Dialog>
  <DialogTrigger>
    <Button>720P · 9:16 · 8s</Button>
  </DialogTrigger>
  <DialogContent>  // 居中显示，有遮罩
    {/* 设置内容 */}
  </DialogContent>
</Dialog>
```

**效果**：
- 点击按钮 → 屏幕中央弹出大对话框
- 背景变暗（遮罩层）
- 需要点击关闭按钮或 ESC 关闭

#### 正确实现（Popover）
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button>
      <div className="flex items-center gap-2">
        <Settings2 className="h-4 w-4" />
        <span>720P · 9:16 · 8s</span>
      </div>
    </Button>
  </PopoverTrigger>
  <PopoverContent align="start" className="w-80">
    <div className="space-y-4">
      {/* 三个独立的选择器 */}
      <Select>...</Select>  // Resolution
      <Select>...</Select>  // Aspect Ratio
      <Select>...</Select>  // Duration
    </div>
  </PopoverContent>
</Popover>
```

**效果**：
- 点击按钮 → 从按钮下方弹出小面板
- 无背景遮罩
- 点击外部自动关闭

### 组件详情

#### Popover 组件 (`components/ui/popover.tsx`)

**功能**：
- 小型弹出面板，从触发元素附近显示
- 不阻塞页面其他交互
- 自动定位（避免超出视口）
- 点击外部关闭

**属性**：
- `align`: 对齐方式（start, center, end）
- `sideOffset`: 与触发器的距离
- `className`: 自定义样式

**样式**：
- 宽度：`w-72`（可自定义为 `w-80`）
- 背景：`bg-popover`
- 边框：`border`
- 阴影：`shadow-md`
- 圆角：`rounded-md`
- 内边距：`p-4`

### Settings 按钮弹窗内容

**三个独立的选择器**：

1. **Resolution（分辨率）**
   - 720P
   - 1080P
   - 4K

2. **Aspect Ratio（宽高比）**
   - 9:16 (Vertical)
   - 16:9 (Horizontal)
   - 1:1 (Square)

3. **Duration（时长）**
   - 5 seconds
   - 8 seconds
   - 15 seconds
   - 25 seconds

**布局**：
```
┌─────────────────────────┐
│ Resolution              │
│ ┌─────────────────────┐ │
│ │ 720P            ▼   │ │
│ └─────────────────────┘ │
│                         │
│ Aspect Ratio            │
│ ┌─────────────────────┐ │
│ │ 9:16 (Vertical) ▼   │ │
│ └─────────────────────┘ │
│                         │
│ Duration                │
│ ┌─────────────────────┐ │
│ │ 8 seconds       ▼   │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### Generate Videos 按钮

**使用 DropdownMenu**（保持不变）：
- 更适合简单的列表选择
- 下拉菜单样式

**选项**：
- Generate 1 video
- Generate 2 videos
- Generate 4 videos
- Generate 8 videos

### 新增依赖

```json
{
  "dependencies": {
    "@radix-ui/react-popover": "^1.1.2"
  }
}
```

### 文件修改

1. **`components/ui/popover.tsx`** - 新建 Popover 组件
2. **`components/video-generator-form.tsx`** - 使用 Popover 替代 Dialog
3. **`package.json`** - 添加 @radix-ui/react-popover 依赖

### 交互流程

#### Settings 按钮：
1. 用户点击 "720P · 9:16 · 8s"
2. 从按钮下方弹出设置面板（无遮罩）
3. 用户修改分辨率/比例/时长
4. 点击外部或再次点击按钮关闭

#### Generate Videos 按钮：
1. 用户点击 "Generate 1 videos"
2. 从按钮下方弹出下拉菜单
3. 用户选择数量（1/2/4/8）
4. 点击选项后菜单自动关闭

### 验证

- ✅ 构建成功（无错误）
- ✅ Settings 按钮打开 Popover（小弹窗）
- ✅ Generate 按钮打开 DropdownMenu
- ✅ 点击外部自动关闭
- ✅ 无全屏遮罩
- ✅ 弹窗从按钮旁边弹出
- ✅ 服务器运行在 http://localhost:3001

### 视觉对比

**之前（Dialog）**：
```
┌────────────────────────────────────┐
│          背景遮罩（半透明）           │
│                                    │
���     ┌──────────────────────┐      │
│     │  Video Settings      │      │
│     │  ──────────────      │      │
│     │  [设置表单]          │      │
│     │                      │      │
│     │            [关闭 X]  │      │
│     └──────────────────────┘      │
│                                    │
└────────────────────────────────────┘
```

**现在（Popover）**：
```
┌─ Settings 按钮 ─┐
│ 720P · 9:16 · 8s│
└─────────────────┘
      ↓
┌─────────────────────┐
│ Resolution          │
│ [720P        ▼]     │
│                     │
│ Aspect Ratio        │
│ [9:16        ▼]     │
│                     │
│ Duration            │
│ [8 seconds   ▼]     │
└─────────────────────┘
```

### 后续工作

1. **状态管理** - 保存用户选择的设置
2. **同步显示** - 将选择的值更新到按钮文本
3. **API 集成** - 将设置传递给后端
4. **持久化** - 保存到 localStorage

**访问地址**: http://localhost:3001 或 http://45.76.70.183:3001
