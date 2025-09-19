# Canvas 2D 渲染系统

这个目录包含了专门针对 Canvas 2D API 的渲染实现，与通用的 RenderEngine 分离，支持未来扩展其他渲染引擎。

## 🏗️ 架构设计

```
通用层:        RenderEngine (抽象，不绑定具体技术)
              ↓
Canvas专用层:   CanvasRenderEngine (继承RenderEngine + Canvas 2D特性)
              ↓
应用层:        CanvasRenderer (向后兼容的API)
```

## 🎯 核心组件

### 1. **CanvasRenderEngine** - Canvas 专用渲染引擎

继承通用`RenderEngine`，添加 Canvas 2D 特定功能：

- Canvas context 管理
- 尺寸调整
- 像素比支持
- Canvas 特定的清除和销毁逻辑

### 2. **CanvasRenderer** - 向后兼容渲染器

提供与原有代码兼容的 API，内部使用`CanvasRenderEngine`：

- 兼容原有的`init(canvas)`、`render()`、`clear()`方法
- 封装 Canvas 特定操作
- 简化使用接口

### 3. **全局实例和工厂函数**

- `globalCanvasRenderEngine` - 全局 Canvas 渲染引擎
- `createCanvasRenderer()` - 创建新的 Canvas 渲染器
- `initializeCanvasRenderSystem()` - 初始化整个 Canvas 渲染系统

## 🚀 使用方式

### 基础用法

```typescript
import { CanvasRenderer } from "@/core/render/canvas";

// 创建渲染器
const renderer = new CanvasRenderer();

// 初始化
const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
renderer.init(canvas);

// 渲染
renderer.render(null, 1.0, { x: 0, y: 0 });

// 清理
renderer.destroy();
```

### 使用 Canvas 渲染引擎 (更强大)

```typescript
import { CanvasRenderEngine } from "@/core/render/canvas";

// 创建渲染引擎
const engine = new CanvasRenderEngine();

// 初始化
engine.initializeCanvas(canvas);

// 渲染页面
engine.renderCanvasPage(page, {
  renderRulers: true,
  renderGrid: true,
  rulerRenderer: (ctx, canvas) => {
    /* 自定义标尺渲染 */
  },
});

// 渲染单个节点
engine.renderCanvasNode(rectangleNode);

// 调整尺寸
engine.resizeCanvas(800, 600, window.devicePixelRatio);
```

### 使用全局实例

```typescript
import {
  globalCanvasRenderEngine,
  initializeCanvasRenderSystem,
} from "@/core/render/canvas";

// 方式1: 直接使用全局实例
globalCanvasRenderEngine.initializeCanvas(canvas);

// 方式2: 使用初始化函数
const engine = await initializeCanvasRenderSystem(canvas);
```

## 🔧 架构优势

### 1. **分离关注点**

- **通用 RenderEngine**: 不依赖任何具体渲染技术，专注于节点树、渲染器注册等通用逻辑
- **CanvasRenderEngine**: 专门处理 Canvas 2D 相关的 context 管理、像素比、尺寸调整等
- **CanvasRenderer**: 提供简化的应用层 API

### 2. **支持多渲染引擎**

```typescript
// 未来可以轻松添加其他渲染引擎
src/core/render/
├── canvas/           # Canvas 2D 渲染
│   ├── CanvasRenderEngine.ts
│   └── CanvasRenderer.ts
├── webgl/           # WebGL 渲染 (计划中)
│   ├── WebGLRenderEngine.ts
│   └── WebGLRenderer.ts
├── webgpu/          # WebGPU 渲染 (计划中)
│   ├── WebGPURenderEngine.ts
│   └── WebGPURenderer.ts
└── RenderEngine.ts  # 通用基类
```

### 3. **向后兼容**

现有使用`CanvasRenderer`的代码无需修改，同时新代码可以使用更强大的`CanvasRenderEngine`。

### 4. **类型安全**

每个渲染引擎都有自己的类型定义，避免了在通用层使用`CanvasRenderingContext2D`等具体类型。

## 🌟 扩展新渲染引擎

要添加新的渲染引擎（如 WebGL），只需：

1. **创建目录**: `src/core/render/webgl/`
2. **实现 WebGL 渲染引擎**:
   ```typescript
   export class WebGLRenderEngine extends RenderEngine {
     private gl: WebGLRenderingContext;
     // WebGL特定实现
   }
   ```
3. **提供 WebGL 渲染器**:
   ```typescript
   export class WebGLRenderer {
     // 简化的WebGL API
   }
   ```
4. **导出**: 在`webgl/index.ts`中导出相关类

这样就实现了渲染引擎的完全分离，每个引擎都有自己的特性，同时共享通用的渲染逻辑！🎨
