# Canvas 组件系统使用指南

## 🎯 系统概览

我们实现了一个类似 Skia 的 Canvas 组件系统，支持：

- **节点树渲染**：根据数据自动渲染用户设计内容
- **UI 辅助层**：网格、标尺等不在节点树中的 UI 元素
- **分层渲染**：背景层 → 内容层 → UI 前景层
- **声明式组件**：类似 JSX 的组件使用方式

## 🏗️ 架构层次

```
┌─────────────────────────────────────────────────────────┐
│                    Canvas 组件                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │                UI 前景层                        │    │
│  │  ┌───────────┐  ┌───────────┐  ┌──────────┐    │    │
│  │  │   标尺    │  │   工具    │  │  选择框  │    │    │
│  │  └───────────┘  └───────────┘  └──────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │                  内容层                         │    │
│  │  ┌───────────┐  ┌───────────┐  ┌──────────┐    │    │
│  │  │  页面背景  │  │   矩形    │  │   文字   │    │    │
│  │  └───────────┘  └───────────┘  └──────────┘    │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │                UI 背景层                        │    │
│  │  ┌───────────┐  ┌───────────┐                   │    │
│  │  │   网格    │  │   背景    │                   │    │
│  │  └───────────┘  └───────────┘                   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## 🚀 基本使用

### 1. 简单的 Canvas

```tsx
import { Canvas, Grid, Ruler, Background } from "../../core/render";

function MyCanvas() {
  return (
    <Canvas
      width={800}
      height={600}
      currentPage={currentPage}
      viewState={viewState}
    >
      {/* 背景 */}
      <Background backgroundColor="#f8f9fa" />

      {/* 网格 */}
      <Grid visible={true} gridSize={20} strokeStyle="#e0e0e0" />

      {/* 标尺 */}
      <Ruler visible={true} rulerSize={25} backgroundColor="#f0f0f0" />
    </Canvas>
  );
}
```

### 2. 动态控制 UI 元素

```tsx
function CanvasWithControls() {
  const [showGrid, setShowGrid] = useState(true);
  const [showRuler, setShowRuler] = useState(true);
  const [gridSize, setGridSize] = useState(20);

  return (
    <div>
      {/* 控制面板 */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
          />
          显示网格
        </label>

        <input
          type="range"
          min="10"
          max="50"
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
        />
      </div>

      {/* Canvas */}
      <Canvas currentPage={currentPage}>
        <Grid visible={showGrid} gridSize={gridSize} strokeStyle="#ddd" />
        <Ruler visible={showRuler} />
      </Canvas>
    </div>
  );
}
```

## 🎨 可用组件

### Background 背景组件

```tsx
<Background
  visible={true} // 是否可见
  backgroundColor="#ffffff" // 背景颜色
  zIndex={-20} // 层级（负数为背景层）
/>
```

### Grid 网格组件

```tsx
<Grid
  visible={true} // 是否可见
  gridSize={20} // 网格大小（像素）
  strokeStyle="#e0e0e0" // 线条颜色
  lineWidth={1} // 线条宽度
  zIndex={-10} // 层级
/>
```

### Ruler 标尺组件

```tsx
<Ruler
  visible={true} // 是否可见
  rulerSize={25} // 标尺厚度（像素）
  backgroundColor="#f0f0f0" // 背景颜色
  textColor="#333" // 文字颜色
  strokeStyle="#ccc" // 边框颜色
  zIndex={10} // 层级（正数为前景层）
/>
```

## 🔧 高级用法

### 1. 自定义 UI 渲染元素

```tsx
// 创建自定义渲染元素
class CustomUIElement extends UIRenderElement {
  render(context: RenderContext): void {
    const { ctx } = context;

    // 自定义绘制逻辑
    ctx.fillStyle = "red";
    ctx.fillRect(10, 10, 100, 100);
  }
}

// 在组件中使用
function MyCanvas() {
  const canvasRef = useRef<CanvasComponentRef>(null);

  useEffect(() => {
    const renderer = canvasRef.current?.getRenderer();
    if (renderer) {
      const customElement = new CustomUIElement();
      renderer.addUIElement(customElement);
    }
  }, []);

  return <Canvas ref={canvasRef} />;
}
```

### 2. 获取渲染器实例

```tsx
function AdvancedCanvas() {
  const canvasRef = useRef<CanvasComponentRef>(null);

  const handleRendererReady = (renderer: NodeTreeCanvasRenderer) => {
    // 可以直接操作渲染器
    console.log("渲染器准备就绪:", renderer);

    // 添加自定义UI元素
    const customGrid = new GridRenderElement({
      gridSize: 50,
      strokeStyle: "red",
      zIndex: -5,
    });
    renderer.addUIElement(customGrid);
  };

  return <Canvas ref={canvasRef} onRendererReady={handleRendererReady} />;
}
```

## 📊 性能优化

### 1. 分层渲染

- **背景层** (zIndex < 0)：网格、背景等，不随视图变换
- **内容层** (节点树)：用户设计内容，受视图变换影响
- **前景层** (zIndex ≥ 0)：标尺、工具等，不随视图变换

### 2. 渲染调度

- 使用 `requestAnimationFrame` 防抖渲染
- 只在数据变化时重建渲染树
- UI 元素按 zIndex 排序，优化渲染顺序

### 3. 内存管理

- 组件卸载时自动清理渲染元素
- 懒加载创建渲染对象
- 属性变化时自动失效缓存

## 🎯 与 Skia 对比

| 特性       | Skia 系统   | 我们的系统          |
| ---------- | ----------- | ------------------- |
| 声明式组件 | `<ck-rect>` | `<Grid>`, `<Ruler>` |
| 分层渲染   | ✅          | ✅                  |
| 事件系统   | 复杂        | 简化                |
| 性能       | WebGL       | Canvas2D            |
| 易用性     | 中等        | 简单                |

## 🔮 扩展方向

1. **更多 UI 组件**：选择框、辅助线、坐标轴等
2. **动画系统**：基于 UI 元素的动画框架
3. **交互增强**：拖拽、缩放、旋转等
4. **主题系统**：支持深色模式等主题切换

这个系统为 Canvas 应用提供了强大而灵活的 UI 渲染能力！🎉
