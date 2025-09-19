# 节点渲染系统设计文档

## 🎯 系统概述

新的节点渲染系统基于**渲染器注册中心**的设计模式，提供了一个可扩展、类型安全的节点渲染架构。系统可以根据节点类型自动选择合适的渲染器，支持自定义渲染器注册。

## 🏗️ 架构设计

```
RenderEngine (渲染引擎)
    ├── RenderRegistry (注册中心)
    │   ├── RectangleRenderer (矩形渲染器)
    │   ├── DefaultRenderer (默认渲染器)
    │   └── ... (其他自定义渲染器)
    └── RenderContext (渲染上下文)
```

### 核心组件

1. **INodeRenderer** - 渲染器接口标准
2. **BaseNodeRenderer** - 渲染器基类
3. **RenderRegistry** - 渲染器注册管理
4. **RenderEngine** - 统一渲染引擎
5. **RenderContext** - 渲染上下文

## 📋 接口设计

### INodeRenderer 接口

```typescript
interface INodeRenderer<T extends BaseNode = BaseNode> {
  readonly type: string; // 渲染器类型
  render(node: T, context: RenderContext): void; // 渲染方法
  canRender(node: BaseNode): node is T; // 类型检查
  getBounds?(node: T): BoundingBox; // 边界框获取
  priority?: number; // 渲染优先级
}
```

### RenderContext 上下文

```typescript
interface RenderContext {
  ctx: CanvasRenderingContext2D; // Canvas上下文
  canvas: HTMLCanvasElement; // Canvas元素
  viewMatrix?: DOMMatrix; // 视图变换矩阵
  scale?: number; // 缩放比例
}
```

## 🔧 使用指南

### 1. 基础使用

```typescript
import { globalRenderEngine } from "../core/render";

// 在页面渲染中使用
function renderPage(
  page: Page,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  globalRenderEngine.renderPage(page, ctx, canvas);
}

// 渲染单个节点
function renderNode(
  node: BaseNode,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement
) {
  const success = globalRenderEngine.renderNode(node, ctx, canvas);
  console.log(`节点渲染${success ? "成功" : "失败"}`);
}
```

### 2. 创建自定义渲染器

```typescript
import { BaseNodeRenderer, RenderContext } from "../core/render";
import { CircleNode } from "./CircleNode";

class CircleRenderer extends BaseNodeRenderer<CircleNode> {
  readonly type = "circle";
  priority = 10;

  render(node: CircleNode, context: RenderContext): void {
    const { ctx } = context;

    this.withCanvasState(context, () => {
      // 应用节点变换
      this.applyNodeTransform(node, context);

      // 绘制圆形
      ctx.beginPath();
      ctx.arc(node.radius, node.radius, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.fill;
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.stroke();
    });
  }

  // 圆形碰撞检测
  isPointInside(node: CircleNode, x: number, y: number): boolean {
    const centerX = node.x + node.radius;
    const centerY = node.y + node.radius;
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    return distance <= node.radius;
  }
}
```

### 3. 注册自定义渲染器

```typescript
import { globalRenderEngine } from "../core/render";

// 注册单个渲染器
const circleRenderer = new CircleRenderer();
globalRenderEngine.addRenderer(circleRenderer);

// 批量注册
const customRenderers = [
  new CircleRenderer(),
  new TextRenderer(),
  new ImageRenderer(),
];
globalRenderEngine.getRegistry().registerAll(customRenderers);
```

### 4. 检查渲染器支持

```typescript
// 检查是否支持某个节点类型
if (globalRenderEngine.supportsNodeType("circle")) {
  console.log("支持圆形节点渲染");
}

// 获取所有支持的类型
const supportedTypes = globalRenderEngine.getSupportedNodeTypes();
console.log("支持的节点类型:", supportedTypes);
```

## 🎨 内置渲染器

### RectangleRenderer

负责渲染矩形节点，支持：

- ✅ 基础矩形绘制
- ✅ 圆角矩形支持
- ✅ 边框和填充
- ✅ 节点标签显示
- ✅ 旋转变换

```typescript
// 矩形节点示例
const rectNode = {
  id: "rect_001",
  type: "rectangle",
  x: 100,
  y: 100,
  w: 200,
  h: 150,
  fill: "#ff5733",
  radius: 10,
  rotation: 45,
};
```

### DefaultRenderer

兜底渲染器，用于处理未知类型节点：

- ✅ 虚线边框占位符
- ✅ 半透明背景
- ✅ 对角线标识
- ✅ 节点信息显示
- ✅ 最低优先级

## ⚡ 高级特性

### 1. 渲染器优先级

```typescript
class HighPriorityRenderer extends BaseNodeRenderer {
  priority = 100; // 高优先级
  // ...
}

class LowPriorityRenderer extends BaseNodeRenderer {
  priority = 1; // 低优先级
  // ...
}
```

### 2. 条件渲染器

```typescript
class ConditionalRenderer extends BaseNodeRenderer {
  canRender(node: BaseNode): boolean {
    // 自定义渲染条件
    return node.type === "special" && node.visible === true;
  }
}
```

### 3. 辅助方法

```typescript
class CustomRenderer extends BaseNodeRenderer {
  render(node: BaseNode, context: RenderContext): void {
    // 使用基类提供的辅助方法
    this.withCanvasState(context, () => {
      this.applyNodeTransform(node, context);
      // 自定义绘制逻辑
    });
  }
}
```

## 🔍 调试和监控

### 渲染统计

```typescript
// 获取渲染器统计信息
const stats = globalRenderEngine.getRegistry().getStats();
console.log("渲染器统计:", stats);
/*
输出:
{
  totalRenderers: 3,
  registeredTypes: ["rectangle", "circle", "default"],
  hasDefaultRenderer: true
}
*/
```

### 错误处理

系统内置完善的错误处理机制：

- 🛡️ 渲染器未找到警告
- 🛡️ 渲染异常捕获
- 🛡️ 节点创建失败处理
- 🛡️ 优雅降级到默认渲染器

## 🚀 性能优化

### 1. 渲染器缓存

```typescript
// 渲染器按优先级排序缓存
// 避免每次查找时重新排序
```

### 2. 上下文状态管理

```typescript
// 自动保存和恢复Canvas状态
this.withCanvasState(context, () => {
  // 渲染逻辑，状态会自动恢复
});
```

### 3. 批量渲染

```typescript
// 支持批量渲染多个节点
const renderedCount = registry.renderNodes(nodes, context);
```

## 🔧 扩展指南

### 添加新节点类型

1. **定义节点类**

```typescript
export class TextNode extends BaseNode {
  get text(): string {
    return this._state.text || "";
  }
  get fontSize(): number {
    return this._state.fontSize || 16;
  }
  get fontFamily(): string {
    return this._state.fontFamily || "Arial";
  }
}
```

2. **实现渲染器**

```typescript
export class TextRenderer extends BaseNodeRenderer<TextNode> {
  readonly type = "text";

  render(node: TextNode, context: RenderContext): void {
    // 文本渲染逻辑
  }
}
```

3. **注册渲染器**

```typescript
globalRenderEngine.addRenderer(new TextRenderer());
```

### 自定义渲染引擎

```typescript
import { RenderEngine, RenderRegistry } from "../core/render";

// 创建独立的渲染引擎实例
const customRegistry = new RenderRegistry();
const customEngine = new RenderEngine(customRegistry);

// 注册自定义渲染器
customEngine.addRenderer(new MyCustomRenderer());
```

## 📊 最佳实践

1. **渲染器命名**: 使用 `{NodeType}Renderer` 格式
2. **类型安全**: 充分利用 TypeScript 泛型
3. **错误处理**: 在自定义渲染器中添加适当的错误处理
4. **性能考虑**: 避免在渲染循环中创建对象
5. **状态管理**: 使用 `withCanvasState` 确保状态正确恢复

## 🎯 未来规划

- [ ] 支持 WebGL 渲染器
- [ ] 添加渲染器性能分析
- [ ] 实现渲染器热重载
- [ ] 支持渲染器插件系统
- [ ] 添加更多内置节点类型
