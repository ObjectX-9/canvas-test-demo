# 统一 UI 视图变换系统

## 🎯 设计理念

实现了**关注点分离**的架构设计：

- **外层负责计算**：Canvas 组件层统一计算视图变换信息
- **内层只管渲染**：UI 元素接收变换信息，专注于渲染逻辑
- **接口统一**：所有 UI 元素都使用相同的 ViewTransform 接口

## 🏗️ 架构流程

```
用户交互/数据变化
        ↓
ViewState 更新 (viewManager)
        ↓
NodeTreeCanvasRenderer.calculateViewTransform()
        ↓
统一的 ViewTransform { scale, offsetX, offsetY }
        ↓
分发给所有UI元素: renderTree(context, viewTransform)
        ↓
各UI元素根据ViewTransform进行渲染
```

## 🔧 核心接口

### ViewTransform 接口

```typescript
interface ViewTransform {
  scale: number; // 缩放倍数
  offsetX: number; // X轴偏移
  offsetY: number; // Y轴偏移
}
```

### UIRenderElement 统一基类

```typescript
abstract class UIRenderElement {
  // 统一的渲染接口
  abstract render(context: RenderContext, viewTransform?: ViewTransform): void;

  // 统一的树形渲染
  renderTree(context: RenderContext, viewTransform?: ViewTransform): void;
}
```

## 🎨 支持的 UI 元素

### 1. 网格 (GridRenderElement)

- ✅ **视图跟随**：根据缩放调整网格密度
- ✅ **性能优化**：网格过小/过大时自动隐藏
- ✅ **对齐准确**：网格线始终对齐世界坐标

```typescript
// 网格会根据视图变换自动调整
render(context: RenderContext, viewTransform?: ViewTransform): void {
  const scaledGridSize = this.gridSize * (viewTransform?.scale || 1);
  // 智能调整网格密度和起始位置
}
```

### 2. 标尺 (RulerRenderElement)

- ✅ **动态刻度**：根据缩放调整刻度间距
- ✅ **世界坐标**：显示真实的世界坐标值
- ✅ **原点标记**：红色线标记坐标原点位置

```typescript
// 标尺会根据视图变换显示正确的坐标
render(context: RenderContext, viewTransform?: ViewTransform): void {
  // 计算世界坐标范围
  const worldStartX = -offsetX / scale;
  // 绘制对应的刻度标签
}
```

### 3. 背景 (BackgroundRenderElement)

- ✅ **固定渲染**：不受视图变换影响
- ✅ **接口统一**：保持相同的渲染接口

## 🚀 使用示例

### 基本使用

```tsx
<Canvas currentPage={currentPage} viewState={viewState}>
  {/* 背景层 - 不受视图影响 */}
  <Background backgroundColor="#f8f9fa" zIndex={-20} />

  {/* 网格层 - 跟随视图移动和缩放 */}
  <Grid visible={showGrid} gridSize={20} strokeStyle="#e0e0e0" zIndex={-10} />

  {/* 标尺层 - 显示动态坐标 */}
  <Ruler visible={showRuler} rulerSize={25} zIndex={10} />
</Canvas>
```

### 添加自定义 UI 元素

```typescript
class CustomUIElement extends UIRenderElement {
  render(context: RenderContext, viewTransform?: ViewTransform): void {
    const { ctx } = context;
    const scale = viewTransform?.scale || 1;

    // 根据视图变换进行自定义渲染
    ctx.strokeStyle = "#ff0000";
    ctx.lineWidth = 2 / scale; // 保持线条粗细恒定
    // ... 自定义绘制逻辑
  }
}
```

## 📊 性能优化

### 1. 集中计算

- **一次计算，多次使用**：ViewTransform 在渲染器层计算一次
- **避免重复计算**：UI 元素不需要各自解析 ViewState

### 2. 智能渲染

- **网格自适应**：根据缩放自动调整密度，避免过密渲染
- **标尺优化**：只渲染可视区域内的刻度
- **分层渲染**：按 zIndex 分层，优化渲染顺序

### 3. 内存管理

- **无状态渲染**：UI 元素不保存视图状态，减少内存占用
- **参数传递**：通过参数传递，避免状态同步问题

## 🎯 优势对比

| 方案     | 旧方案                    | 新方案               |
| -------- | ------------------------- | -------------------- |
| 职责分离 | UI 元素自己解析 ViewState | 外层计算，内层渲染   |
| 代码复用 | 每个 UI 元素重复实现      | 统一接口，一次实现   |
| 性能     | 多次重复计算              | 一次计算，多次使用   |
| 维护性   | 分散的视图逻辑            | 集中的视图计算       |
| 扩展性   | 需要理解 ViewState        | 只需实现 render 方法 |

## 🔮 扩展方向

### 1. 更多 UI 元素

```typescript
// 选择框
class SelectionBoxElement extends UIRenderElement {
  render(context, viewTransform) {
    // 绘制选择框，考虑视图变换
  }
}

// 辅助线
class GuideLineElement extends UIRenderElement {
  render(context, viewTransform) {
    // 绘制对齐辅助线
  }
}
```

### 2. 高级功能

- **视差效果**：不同 UI 元素使用不同的视图变换系数
- **性能监控**：监控 UI 元素渲染性能
- **批量更新**：批量更新多个 UI 元素状态

这个统一的 UI 视图变换系统实现了**高内聚、低耦合**的设计，让 UI 元素专注于渲染，外层统一管理视图计算！🎉
