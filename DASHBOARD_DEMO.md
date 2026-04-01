# Dashboard 组件演示

## 组件说明

已复刻 CreatOK.ai 的侧边栏和顶部栏设计，包含以下组件：

### 1. Sidebar (侧边栏)
**位置**: `components/dashboard/sidebar.tsx`

**功能特性**:
- ✅ Logo 和品牌展示 (橙色 "ct" 图标 + CreatOK 文字)
- ✅ 折叠/展开功能 (点击菜单按钮)
- ✅ 用户空间选择器 (个人空间下拉菜单)
- ✅ 分组导航结构:
  - 主导航: 首页、视频分析
  - 创作: 视频 (Sora 2)、图片 (2)、一键同款 (New)
  - Sora 2 子菜单: 灵感广场、Sora 生成 (标准可用)、提示词模型
  - 工具: 创意 t4o
  - 平台: 视频发布 (官方免费)
- ✅ 标签徽章系统 (橙色、绿色、灰色)
- ✅ 可展开/收起的子菜单
- ✅ 底部用户信息卡 (头像 + 邮箱)
- ✅ 悬停效果和激活状态高亮

**设计细节**:
- 宽度: 240px (展开) / 64px (折叠)
- 背景色: `--sidebar-bg` (#1a1a1a)
- 悬停色: `--sidebar-hover` (#292929)
- 激活色: `--sidebar-active` (#292929)
- 圆角: 12px (按钮/卡片)

### 2. TopBar (顶部栏)
**位置**: `components/dashboard/topbar.tsx`

**功能特性**:
- ✅ Skills 按钮 (带 🎯 emoji)
- ✅ 帮助图标 (问号)
- ✅ 消息通知图标
- ✅ 升级按钮 (橙色皇冠图标)
- ✅ 积分显示 (+0 积分)

**设计细节**:
- 高度: 64px
- 背景色: `--topbar-bg` (#0f0f0f)
- 右对齐布局
- 圆角按钮: 8px

### 3. DashboardLayout (布局容器)
**位置**: `components/dashboard/dashboard-layout.tsx`

**功能特性**:
- ✅ 组合 Sidebar + TopBar
- ✅ 自适应内容区域
- ✅ 全屏布局 (h-screen)
- ✅ 支持滚动 (overflow-y-auto)

## 配色方案

已更新 `app/globals.css`，新增 CreatOK 风格变量：

```css
--brand-orange: 18 100% 60%;       /* 橙色品牌色 #FF6B35 */
--brand-green: 142 71% 45%;        /* 绿色强调色 */
--sidebar-bg: 0 0% 10%;            /* 侧边栏背景 */
--sidebar-hover: 0 0% 16%;         /* 侧边栏悬停 */
--sidebar-active: 0 0% 16%;        /* 侧边栏激活 */
--topbar-bg: 0 0% 6%;              /* 顶部栏背景 */
```

## 使用示例

### 基础使用

```tsx
import { DashboardLayout } from '@/components/dashboard';

export default function DashboardPage() {
  return (
    <DashboardLayout credits={100}>
      <div className="p-8">
        <h1 className="text-4xl font-semibold">您的内容</h1>
      </div>
    </DashboardLayout>
  );
}
```

### 自定义积分

```tsx
<DashboardLayout credits={250}>
  {/* 您的内容 */}
</DashboardLayout>
```

### 单独使用组件

```tsx
import { Sidebar, TopBar } from '@/components/dashboard';

export default function CustomLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar credits={50} />
        <main className="flex-1 p-8">
          {/* 您的内容 */}
        </main>
      </div>
    </div>
  );
}
```

## 访问演示

启动开发服务器后访问：

```bash
cd /root/ccccckv/rocket-plan/frontend
npm run dev
```

访问 `http://localhost:3001/dashboard` 查看效果

## 响应式设计

当前版本为桌面端设计，后续可以添加:
- 移动端侧边栏抽屉 (drawer)
- 平板端优化
- 顶部栏自适应隐藏

## 技术栈

- **框架**: Next.js 16 (App Router)
- **UI 组件**: Radix UI
- **样式**: Tailwind CSS v4
- **图标**: Lucide React
- **类型**: TypeScript

## 组件导出

```tsx
// 从统一入口导入
import { 
  Sidebar, 
  TopBar, 
  DashboardLayout 
} from '@/components/dashboard';
```

## 下一步

可以基于此布局添加:
1. 主内容区的功能卡片网格
2. 视频生成表单
3. 灵感广场列表
4. 用户设置页面
5. 视频管理页面
