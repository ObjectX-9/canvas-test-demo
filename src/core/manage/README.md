# 管理模块 (Manage)

这个模块包含了画布系统的各种管理器，用于处理不同层面的状态和操作。

## 管理器列表

### CoordinateSystemManager

坐标系统管理器，负责处理画布的坐标转换和缩放。

### PageManager

页面管理器，负责管理画布的页面切换和状态。

### RulerManager ✨ NEW!

标尺管理器，负责绘制和管理画布标尺的显示。

## RulerManager 使用指南

RulerManager 提供了完整的标尺管理功能，包括样式配置、主题切换和显示控制。

### 基本用法

```typescript
import { rulerManager } from "../core/manage";

// 直接在Canvas上绘制标尺
const ctx = canvas.getContext("2d");
rulerManager.render(ctx, canvas);

// 切换标尺显示
rulerManager.toggle(false); // 隐藏标尺
rulerManager.toggle(true); // 显示标尺

// 设置主题
rulerManager.setTheme("dark"); // 深色主题
rulerManager.setTheme("light"); // 浅色主题
```

### 配置选项

RulerManager 支持丰富的配置选项：

```typescript
import { RulerManager } from "../core/manage";

const customRuler = new RulerManager({
  // 样式配置
  strokeColor: "#333", // 刻度线颜色
  textColor: "#666", // 文字颜色
  font: "14px Arial", // 字体
  rulerHeight: 12, // 标尺高度
  textOffset: 25, // 文字偏移

  // 步长配置
  minStepPixels: 60, // 最小步长像素
  baseStep: 10, // 基础步长

  // 显示配置
  showNumbers: true, // 显示数字
  showTicks: true, // 显示刻度线
});
```

### 动态配置

```typescript
// 更新配置
rulerManager.updateConfig({
  strokeColor: "#ff0000",
  rulerHeight: 15,
});

// 获取当前配置
const config = rulerManager.getConfig();
console.log(config.strokeColor); // 当前刻度线颜色
```

### 主题系统

RulerManager 内置了主题系统：

```typescript
// 浅色主题（默认）
rulerManager.setTheme("light");
// - 黑色刻度线和文字
// - 适合浅色背景

// 深色主题
rulerManager.setTheme("dark");
// - 白色刻度线和文字
// - 适合深色背景
```

### 智能步长计算

标尺会根据当前缩放级别自动计算合适的步长：

- 基础步长：10 像素
- 当步长在屏幕上小于 50 像素时，自动加倍
- 确保标尺刻度间距始终清晰可读

### 性能特性

- **自动缓存**: 上下文状态自动保存和恢复
- **精确计算**: 基于视口和缩放的精确刻度计算
- **响应式**: 随视图变化自动调整显示范围
- **轻量级**: 最小化 Canvas API 调用

## PageManager 使用指南

PageManager 提供了完整的页面管理功能，包括创建、切换、删除和管理页面状态。

### 基本用法

```typescript
import { pageManager } from "../core/manage";

// 获取当前页面
const currentPage = pageManager.getCurrentPage();
console.log(currentPage?.name); // "页面 1"

// 创建新页面
const newPage = pageManager.createPage({
  name: "我的新页面",
  backgroundColor: "#f0f0f0",
  width: 1200,
  height: 800,
});

// 切换到新页面
pageManager.switchToPage(newPage.id);

// 获取所有页面
const allPages = pageManager.getAllPages();
console.log(`总共有 ${allPages.length} 个页面`);
```

### 页面属性

每个页面包含以下属性：

- `name`: 页面名称
- `backgroundColor`: 背景颜色
- `width/height`: 画布尺寸
- `children`: 子节点 ID 列表
- `isActive`: 是否为当前活动页面
- `zoom`: 缩放级别
- `panX/panY`: 视图偏移

### 页面操作

```typescript
// 重命名页面
pageManager.renamePage(pageId, "新名称");

// 复制页面
const duplicatedPage = pageManager.duplicatePage(pageId);

// 删除页面
pageManager.deletePage(pageId);

// 检查页面是否存在
if (pageManager.hasPage(pageId)) {
  // 页面存在
}
```

### 页面视图操作

```typescript
const page = pageManager.getCurrentPage();
if (page) {
  // 设置缩放
  page.zoom = 1.5;

  // 设置视图偏移
  page.panX = 100;
  page.panY = 50;

  // 重置视图
  page.resetView();

  // 管理子节点
  page.addChild("element_001");
  page.removeChild("element_002");
}
```

### 注意事项

1. PageManager 自动创建一个默认页面
2. 不能删除最后一个页面
3. 删除当前页面时会自动切换到其他页面
4. 缩放级别限制在 0.1 到 10 之间
5. 每个画布只能有一个活动页面

## 管理器集成

所有管理器都可以通过统一的入口导入：

```typescript
import {
  coordinateSystemManager,
  pageManager,
  rulerManager,
} from "../core/manage";

// 在渲染循环中使用
function render(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  // 绘制标尺
  rulerManager.render(ctx, canvas);

  // 应用坐标变换
  const matrix = coordinateSystemManager.getViewTransformMatrix();
  ctx.setTransform(...matrix);

  // 渲染当前页面内容
  const page = pageManager.getCurrentPage();
  // ... 渲染页面子节点
}
```
