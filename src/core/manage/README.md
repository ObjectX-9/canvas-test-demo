# 管理模块 (Manage)

这个模块包含了画布系统的各种管理器，用于处理不同层面的状态和操作。

## 管理器列表

### CoordinateSystemManager

坐标系统管理器，负责处理画布的坐标转换和缩放。

### PageManager

页面管理器，负责管理画布的页面切换和状态。

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
