# 节点树 Canvas 渲染架构

## 🎯 设计理念

基于 Skia 渲染系统的架构思路，我们设计了一个**双层渲染架构**，实现了从抽象节点树到 Canvas 像素的完整渲染管道。

## 🏗️ 架构概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   节点树数据层   │────│   懒加载桥梁    │────│   Canvas渲染层   │
│   (BaseNode)    │    │  (renderDom)   │    │ (RenderElement) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        │                       │                       │
    ┌───▼───┐                ┌──▼──┐                ┌───▼───┐
    │ 数据  │                │转换 │                │ 渲染  │
    │ 管理  │                │缓存 │                │ 执行  │
    └───────┘                └─────┘                └───────┘
```

## 🔧 核心组件

### 1. 数据层 - BaseNode

- **职责**: 管理业务数据和逻辑
- **特性**: 属性变化时自动清除渲染缓存
- **接口**: `renderDom` getter 提供懒加载桥梁

```typescript
class BaseNode {
  private _renderDom: RenderElement | null = null;

  get renderDom(): RenderElement | null {
    if (!this._renderDom) {
      this._renderDom = RenderElementFactory.create(this);
    }
    return this._renderDom;
  }
}
```

### 2. 渲染层 - RenderElement

- **职责**: 专注 Canvas 渲染逻辑
- **继承体系**:
  - `RenderElement` (基类)
  - `RectRenderElement` (矩形)
  - `PageRenderElement` (页面)
  - `ContainerRenderElement` (容器)

```typescript
abstract class RenderElement {
  abstract render(context: RenderContext): void;
  renderTree(context: RenderContext): void {
    this.render(context);
    this.children.forEach((child) => child.renderTree(context));
  }
}
```

### 3. 渲染管理器 - NodeTreeCanvasRenderer

- **职责**: 管理整个渲染流程
- **功能**:
  - 构建 RenderElement 树
  - 管理渲染循环
  - 处理视图变换
  - Canvas 尺寸管理

```typescript
class NodeTreeCanvasRenderer {
  renderPage(pageNode: PageNode, viewState?: ViewInfo): void;
  rebuildRenderTree(pageNode: PageNode): void;
  setCanvasSize(width: number, height: number): void;
}
```

## 🔄 渲染流程

### 完整渲染管道

```
1. 用户操作/数据变化
   ↓
2. 调用 nodeTreeRenderer.renderPage(page)
   ↓
3. 构建渲染树: page.children → node.renderDom → RenderElement树
   ↓
4. 请求渲染: requestAnimationFrame(performRender)
   ↓
5. 执行渲染循环: renderRoot.renderTree(context)
   ↓
6. 每个元素调用 render(context) 绘制到Canvas
   ↓
7. 显示到屏幕
```

### 懒加载机制

```typescript
// 第一次访问时创建
const rectRenderElement = rectNode.renderDom; // 创建 RectRenderElement
// 后续访问返回缓存
const same = rectNode.renderDom; // 返回缓存的实例

// 属性变化时清除缓存
rectNode.x = 100; // 自动调用 invalidateRenderDom()
```

## 🎨 扩展性

### 添加新图形类型

1. 创建新的 RenderElement 子类
2. 在 RenderElementFactory 中注册
3. 在 NodeTree 中添加对应的 Node 类

```typescript
// 1. 创建渲染元素
class CircleRenderElement extends RenderElement {
  render(context: RenderContext): void {
    // Canvas圆形绘制逻辑
  }
}

// 2. 注册到工厂
RenderElementFactory.create(node) {
  case "circle": return new CircleRenderElement(node);
}
```

## 🚀 性能优化

### 1. 懒加载

- RenderElement 只在需要时创建
- 避免不必要的对象实例化

### 2. 渲染缓存

- 属性未变化时复用 RenderElement
- 减少对象创建开销

### 3. 渲染调度

- 使用 requestAnimationFrame 优化渲染时机
- 防抖机制避免过度渲染

### 4. 视图变换

- 利用 Canvas 变换矩阵处理缩放平移
- GPU 硬件加速支持

## 📊 与 Skia 架构对比

| 特性     | Skia 架构       | 我们的架构             |
| -------- | --------------- | ---------------------- |
| 数据层   | JsSkiaElement   | BaseNode               |
| 渲染层   | CkElement       | RenderElement          |
| 桥梁     | skiaDom         | renderDom              |
| 管理器   | JsRenderer      | NodeTreeCanvasRenderer |
| 渲染目标 | WebGL/CanvasKit | Canvas2D               |
| 复杂度   | 高 (企业级)     | 中 (教学级)            |

## 🎯 优势

1. **关注点分离**: 数据管理与渲染逻辑完全分离
2. **懒加载优化**: 按需创建渲染对象，节省内存
3. **类型安全**: 完整的 TypeScript 类型支持
4. **易于扩展**: 工厂模式 + 继承体系
5. **性能优良**: Canvas2D + requestAnimationFrame
6. **架构清晰**: 参考业界成熟方案

## 🔮 未来扩展

1. **WebGL 渲染器**: 替换 Canvas2D 实现 GPU 加速
2. **离屏渲染**: 支持大型画布的分块渲染
3. **动画系统**: 基于 RenderElement 的动画框架
4. **碰撞检测**: 基于 RenderElement 边界的交互检测

这个架构为未来的功能扩展奠定了坚实的基础! 🎉
