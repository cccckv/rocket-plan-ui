# 交互功能实现

## 2025-03-18 - 添加下拉菜单和对话框功能

### 实现的功能

根据原网站 (https://www.creatok.ai) 的交互模式，为模型选择器右边的两个按钮添加了交互功能：

#### 1. Settings 按钮 (720P · 9:16 · 8s)

**交互类型**: Dialog（对话框）

**功能**：
- 点击打开设置对话框
- 配置视频生成参数
- 三个设置选项：
  * **Resolution**: 720P / 1080P / 4K
  * **Aspect Ratio**: 9:16 (Vertical) / 16:9 (Horizontal) / 1:1 (Square)
  * **Duration**: 5s / 8s / 15s / 25s

**实现**：
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>
      <Settings2 className="h-4 w-4" />
      <span>720P · 9:16 · 8s</span>
    </Button>
  </DialogTrigger>
  <DialogContent>
    {/* 设置表单 */}
  </DialogContent>
</Dialog>
```

**HTML 属性**：
- `aria-haspopup="dialog"`
- `aria-expanded="false/true"`

#### 2. Generate Videos 按钮

**交互类型**: DropdownMenu（下拉菜单）

**功能**：
- 点击打开生成数量选择菜单
- 选项：
  * Generate 1 video
  * Generate 2 videos
  * Generate 4 videos
  * Generate 8 videos

**实现**：
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>
      <GalleryHorizontalEnd className="h-4 w-4" />
      <span>Generate 1 videos</span>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>Generate 1 video</DropdownMenuItem>
    <DropdownMenuItem>Generate 2 videos</DropdownMenuItem>
    <DropdownMenuItem>Generate 4 videos</DropdownMenuItem>
    <DropdownMenuItem>Generate 8 videos</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**HTML 属性**：
- `aria-haspopup="menu"`
- `aria-expanded="false/true"`

### 新增组件

#### Dialog 组件
**文件**: `components/ui/dialog.tsx`

**功能**：
- 模态对话框
- 覆盖层（Overlay）
- 关闭按钮
- 动画效果（淡入淡出 + 缩放）
- 键盘支持（ESC 关闭）

**组件**：
- `Dialog` - 根组件
- `DialogTrigger` - 触发器
- `DialogContent` - 内容容器
- `DialogHeader` - 头部
- `DialogTitle` - 标题
- `DialogDescription` - 描述
- `DialogOverlay` - 遮罩层
- `DialogClose` - 关闭按钮

#### DropdownMenu 组件
**文件**: `components/ui/dropdown-menu.tsx`

**功能**：
- 下拉菜单
- 多种菜单项类型（普通、复选框、单选）
- 子菜单支持
- 动画效果
- 键盘导航

**组件**：
- `DropdownMenu` - 根组件
- `DropdownMenuTrigger` - 触发器
- `DropdownMenuContent` - 内容容器
- `DropdownMenuItem` - 菜单项
- `DropdownMenuCheckboxItem` - 复选框项
- `DropdownMenuRadioItem` - 单选项
- `DropdownMenuLabel` - 标签
- `DropdownMenuSeparator` - 分隔线
- `DropdownMenuSub` - 子菜单

### 技术栈

**依赖**：
- `@radix-ui/react-dialog` - 对话框基础组件
- `@radix-ui/react-dropdown-menu` - 下拉菜单基础组件

**特性**：
- ✅ 完全无障碍（ARIA 标准）
- ✅ 键盘导航支持
- ✅ 焦点管理
- ✅ 屏幕阅读器支持
- ✅ 动画过渡效果
- ✅ Portal 渲染（避免 z-index 问题）

### 用户交互流程

#### Settings 按钮：
1. 用户点击 "720P · 9:16 · 8s" 按钮
2. 对话框从中心弹出（缩放 + 淡入动画）
3. 背景显示半透明遮罩
4. 用户修改设置（分辨率、比例、时长）
5. 点击关闭按钮或按 ESC 键关闭

#### Generate Videos 按钮：
1. 用户点击 "Generate 1 videos" 按钮
2. 下拉菜单从按钮下方弹出（滑入 + 淡入动画）
3. 显示 1/2/4/8 个视频选项
4. 用户点击选项，菜单关闭
5. 控制台输出选择结果（后续连接 API）

### 样式特点

**Dialog**：
- 最大宽度：`max-w-lg`
- 背景：`bg-background`
- 边框：`border`
- 阴影：`shadow-lg`
- 圆角：`rounded-lg`
- 位置：居中 `left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]`

**DropdownMenu**：
- 最小宽度：`min-w-[8rem]`
- 背景：`bg-popover`
- 边框：`border`
- 阴影：`shadow-md`
- 圆角：`rounded-md`
- 对齐：`align="end"` 右对齐

### 后续开发

#### 待实现功能：
1. **Settings Dialog**:
   - 保存设置到状态
   - 持久化到 localStorage
   - 应用设置到视频生成

2. **Generate Videos Dropdown**:
   - 更新按钮文本为选中数量
   - 连接到生成 API
   - 根据选择数量调用后端

3. **Enhance Prompt 按钮**:
   - 添加 AI 提示词增强功能
   - Loading 状态
   - 错误处理

### 验证

- ✅ 构建成功（无 TypeScript 错误）
- ✅ 开发服务器运行在 http://localhost:3001
- ✅ Settings 按钮打开对话框
- ✅ Generate Videos 按钮打开下拉菜单
- ✅ 动画效果流畅
- ✅ 键盘导航正常
- ✅ 响应式设计适配

### 参考

原网站行为：
- Settings 按钮：`aria-haspopup="dialog"`
- Generate 按钮：`aria-haspopup="menu"`
- Enhance 按钮：`aria-haspopup="menu"`
