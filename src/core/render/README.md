# 🎨 抽象渲染引擎架构

这个渲染系统实现了完全抽象的图形 API，支持多渲染后端，真正做到了渲染引擎解耦。

## 🏗️ 架构设计

```
抽象层:          IGraphicsAPI + IRenderContext (纯接口，不绑定技术)
              ↓
通用渲染引擎:     RenderEngine (使用抽象接口)
              ↓
具体实现层:       Canvas2DGraphics, WebGLGraphics, WebGPUGraphics...
              ↓
专用渲染引擎:     CanvasRenderEngine, WebGLRenderEngine...
```

## 🎯 核心抽象接口

### **IGraphicsAPI** - 抽象图形 API

定义所有基础绘图操作，完全不依赖具体渲染技术：

- 画布操作: `clearRect`, `fillRect`, `strokeRect`
- 路径操作: `beginPath`, `moveTo`, `lineTo`, `arc`
- 样式设置: `setFillStyle`, `setStrokeStyle`, `setFont`
- 变换操作: `save`, `restore`, `translate`, `rotate`, `scale`
- 文本操作: `fillText`, `measureText`

### **IRenderContext** - 抽象渲染上下文

```typescript
interface IRenderContext {
  graphics: IGraphicsAPI; // 抽象图形接口
  canvasSize: { width: number; height: number };
  viewMatrix: number[];
  scale: number;
}
```

## 🔧 具体实现

### **Canvas 2D 实现**

```typescript
// Canvas2DGraphics.ts - IGraphicsAPI的Canvas 2D实现
export class Canvas2DGraphics implements IGraphicsAPI {
  private ctx: CanvasRenderingContext2D;

  setFillStyle(style: string): void {
    this.ctx.fillStyle = style;
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    this.ctx.fillRect(x, y, w, h);
  }
  // ... 其他方法
}
```

### **WebGL 实现（未来）**

```typescript
// WebGLGraphics.ts - IGraphicsAPI的WebGL实现
export class WebGLGraphics implements IGraphicsAPI {
  private gl: WebGLRenderingContext;

  setFillStyle(style: string): void {
    // WebGL特定的颜色设置
  }

  fillRect(x: number, y: number, w: number, h: number): void {
    // 使用WebGL绘制矩形
  }
}
```

## 🎨 节点渲染器

所有节点渲染器都使用抽象的`IRenderContext`：

```typescript
export class RectangleRenderer extends BaseNodeRenderer<Rectangle> {
  renderNode(node: Rectangle, context: IRenderContext): boolean {
    const { graphics } = context;

    // 使用抽象API，不绑定Canvas 2D
    graphics.setFillStyle(node.fill);
    graphics.fillRect(0, 0, node.w, node.h);

    return true;
  }
}
```

## 🚀 使用方式

### **Canvas 2D 渲染**

```typescript
import { globalCanvasRenderEngine } from "@/core/render/canvas";

// 初始化Canvas渲染引擎
globalCanvasRenderEngine.initializeCanvas(canvas);

// 渲染页面
globalCanvasRenderEngine.renderCanvasPage(page, {
  renderRulers: true,
  renderGrid: true,
});
```

### **未来的 WebGL 渲染（计划）**

```typescript
import { globalWebGLRenderEngine } from "@/core/render/webgl";

// 初始化WebGL渲染引擎
globalWebGLRenderEngine.initializeWebGL(canvas);

// 相同的API，不同的后端
globalWebGLRenderEngine.renderWebGLPage(page, {
  renderRulers: true,
  renderGrid: true,
});
```

## 🌟 架构优势

### **1. 完全抽象**

- ✅ `RenderEngine` 不依赖任何具体渲染技术
- ✅ 节点渲染器使用纯抽象接口
- ✅ 支持无缝切换渲染后端

### **2. 类型安全**

- ✅ 所有接口都有严格的 TypeScript 类型定义
- ✅ 编译时检查，避免运行时错误
- ✅ 智能代码提示和重构支持

### **3. 扩展性强**

添加新渲染引擎只需：

1. 实现`IGraphicsAPI`接口
2. 创建专用渲染引擎类
3. 注册到系统中

### **4. 高性能**

- 🚀 抽象层开销极小
- 🚀 支持硬件加速（WebGL/WebGPU）
- 🚀 按需渲染，避免重复绘制

## 🔄 渲染流程

1. **初始化**: 选择并初始化具体渲染引擎
2. **创建上下文**: 将具体图形 API 包装为`IRenderContext`
3. **节点渲染**: 渲染器使用抽象 API 绘制节点
4. **输出**: 结果输出到对应的渲染目标

## 🎯 设计哲学

> **"抽象胜过具体，接口胜过实现"**

这个架构的核心思想是：

- 🎯 **面向接口编程**: 所有核心逻辑都基于抽象接口
- 🔌 **插件化设计**: 渲染后端可以热插拔
- 📦 **分层架构**: 每一层都有明确的职责边界
- 🔧 **可测试性**: 抽象接口便于单元测试和模拟

这样的设计让我们能够：

- 🚀 **快速适配新技术**: WebGL、WebGPU、SVG 等
- 🧪 **轻松测试**: 模拟渲染器进行单元测试
- 🔄 **灵活切换**: 根据性能需求选择最佳后端
- 📈 **渐进增强**: 从 Canvas 2D 开始，逐步升级到 GPU 加速

**真正实现了"写一次，到处渲染"的愿景！** ✨
