# React 自定义渲染器

基于 React reconciler 的多宿主渲染器抽象设计，支持 Canvas2D、WebGL、CanvasKit 等多种渲染后端。

## 🚀 特性

- **宿主无关**：React 组件可以渲染到多种环境（Canvas、WebGL、原生等）
- **组件化开发**：使用熟悉的 React 组件方式开发图形应用
- **高性能更新**：利用 React reconciler 的增量更新机制
- **类型安全**：完整的 TypeScript 类型定义
- **易于扩展**：通过渲染器工厂支持自定义渲染后端

## 📋 目录结构

```
src/core/render/
├── interfaces/          # 核心接口定义
│   ├── IRenderer.ts     # 渲染器统一接口
│   └── index.ts
├── renderers/           # 具体渲染器实现
│   └── Canvas2DRenderer.ts  # Canvas2D 渲染器
├── react/               # React 集成
│   ├── HostConfig.ts    # React reconciler 配置
│   └── ReactRenderer.ts # React 渲染器封装
├── components/          # React 组件库
│   └── index.tsx        # 基础 Canvas 组件
├── factory/             # 工厂模式
│   └── RendererFactory.ts   # 渲染器工厂
├── examples/            # 使用示例
│   ├── BasicExample.tsx     # 基础示例
│   └── IntegrationExample.tsx  # 集成示例
├── index.ts            # 主入口文件
└── README.md           # 文档（本文件）
```

## 🛠️ 基础用法

### 1. 创建渲染器

```typescript
import { createCanvas2DRenderer } from "./core/render";

const canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
const renderer = createCanvas2DRenderer(canvas);
```

### 2. 使用 React 组件

```jsx
import React from "react";
import { Rect, Circle, Text, Container } from "./core/render";

function App() {
  return (
    <Container>
      <Rect x={10} y={10} width={100} height={50} fill="#ff6b6b" />
      <Circle x={200} y={100} r={30} fill="#4ecdc4" />
      <Text x={50} y={200} text="Hello Canvas!" fontSize={16} />
    </Container>
  );
}

// 渲染到 Canvas
renderer.render(<App />);
```

### 3. 动态更新

```jsx
import React, { useState, useEffect } from "react";

function AnimatedApp() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotation((r) => r + 1);
    }, 16);

    return () => clearInterval(timer);
  }, []);

  return (
    <Container>
      <Circle
        x={200 + Math.sin(rotation * 0.05) * 50}
        y={200 + Math.cos(rotation * 0.05) * 50}
        r={20}
        fill="#ff6b6b"
      />
    </Container>
  );
}
```

## 🧩 核心架构

### 1. 渲染器抽象接口

```typescript
interface IRenderer {
  readonly type: string;
  createElement(type: string, props: Record<string, unknown>): RenderNode;
  appendChild(parent: RenderNode, child: RenderNode): void;
  removeChild(parent: RenderNode, child: RenderNode): void;
  updateElement(instance: RenderNode, oldProps: any, newProps: any): void;
  renderRoot(root: RenderNode, viewState?: ViewState): void;
  clear(): void;
  getSize(): { width: number; height: number };
}
```

### 2. React Reconciler 集成

```typescript
// 创建 HostConfig
function createHostConfig(renderer: IRenderer) {
  return {
    createInstance(type, props) {
      return renderer.createElement(type, props);
    },
    appendChild(parent, child) {
      renderer.appendChild(parent, child);
    },
    commitUpdate(instance, updatePayload, type, oldProps, newProps) {
      renderer.updateElement(instance, oldProps, newProps);
    },
    // ... 其他 reconciler 方法
  };
}
```

### 3. 多渲染器工厂

```typescript
import { rendererFactory } from "./core/render";

// 注册自定义渲染器
rendererFactory.register("webgl", (canvas, options) => {
  return new WebGLRenderer(canvas, options);
});

// 创建 WebGL 渲染器
const webglRenderer = rendererFactory.createRenderer("webgl", canvas);
```

## 📦 可用组件

### 基础几何组件

- `<Rect />` - 矩形
- `<Circle />` - 圆形
- `<Ellipse />` - 椭圆
- `<Line />` - 线条
- `<Path />` - 路径
- `<Text />` - 文本
- `<Image />` - 图片

### 容器组件

- `<Container />` - 基础容器
- `<Group />` - 分组容器

### 组件属性

```typescript
interface GeometryProps {
  x?: number; // X 坐标
  y?: number; // Y 坐标
  fill?: string; // 填充色
  stroke?: string; // 描边色
  strokeWidth?: number; // 描边宽度
  opacity?: number; // 透明度
}
```

## 🔧 扩展自定义渲染器

### 1. 实现渲染器接口

```typescript
class MyCustomRenderer implements IRenderer {
  readonly type = "my-custom";

  createElement(type: string, props: any) {
    // 创建自定义元素
    return { type, props, children: [] };
  }

  renderRoot(root: RenderNode) {
    // 实现自定义渲染逻辑
    this.renderNode(root);
  }

  // ... 实现其他必需方法
}
```

### 2. 注册到工厂

```typescript
import { rendererFactory } from "./core/render";

rendererFactory.register("my-custom", (canvas, options) => {
  return new MyCustomRenderer(canvas, options);
});
```

### 3. 使用自定义渲染器

```typescript
const renderer = rendererFactory.createRenderer("my-custom", canvas);
const reactRenderer = new ReactRenderer(renderer);
```

## 🎯 集成到现有系统

### 1. 与现有 Canvas 系统集成

```typescript
import { integrateReactRenderer } from "./core/render/examples/IntegrationExample";

// 集成到现有 Canvas 系统
const reactRenderer = integrateReactRenderer(existingCanvas, {
  viewState: currentViewState,
  onUpdate: (renderer) => {
    // 处理更新
  },
});
```

### 2. 与坐标系统集成

```typescript
import { coordinateSystemManager } from "../manage";

const viewState = {
  transform: coordinateSystemManager.getViewTransformMatrix(),
  scale: coordinateSystemManager.getScale(),
  translation: coordinateSystemManager.getTranslation(),
};

renderer.updateViewState(viewState);
```

## 🐛 调试和日志

渲染器内置了详细的日志系统：

```
🎨 创建Canvas2D渲染器
🚀 开始React渲染
🎨 创建实例: rect {x: 10, y: 10, width: 100, height: 50}
📝 创建文本实例: Hello World
✅ React渲染完成
🎨 开始底层渲染
✅ 底层渲染完成
```

## ⚡ 性能优化建议

1. **减少虚拟节点层级**：避免过深的组件嵌套
2. **合理使用 key 属性**：帮助 React 进行高效的 diff
3. **避免频繁的属性更改**：使用 `useState` 和 `useMemo` 优化
4. **分片渲染**：对大型场景进行分片处理
5. **对象池管理**：重用渲染对象，避免频繁创建销毁

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交改动：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 打开 Pull Request

## �� 许可证

MIT License
