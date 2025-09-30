# 混合架构：拖拽渲染实现

## 🎯 实现目标

解决 **"节点拖拽时不跟随鼠标"** 的问题，采用混合架构实现流畅的拖拽体验。

## 🏗️ 架构设计

### 核心思路

```
用户拖拽鼠标
    ↓
NodeDragHandler.handle()
    ↓
直接修改节点数据 (node.x, node.y)
    ↓
立即调用 renderer.requestRender()
    ↓
Canvas立即重绘，节点跟随鼠标
```

## 🔧 具体实现

### 1. EventContext 扩展

```typescript
// src/core/manage/EventManager.ts
export interface EventContext {
  // ... 原有属性
  renderer: NodeTreeCanvasRenderer; // 新增渲染器引用
}
```

**作用**: 让事件处理器能够直接触发渲染

### 2. 事件上下文传递

```typescript
// src/components/CanvasContainer/index.tsx
const eventContext = {
  canvas,
  currentPage,
  viewState,
  isDragging,
  lastMousePosition,
  selectionStore,
  coordinateSystemManager,
  setViewState,
  renderer, // 传入渲染器引用
};
```

**作用**: 确保所有事件处理器都能访问到渲染器

### 3. 拖拽中实时渲染

```typescript
// src/core/event/nodeDrag.ts - NodeDragHandler
handle(event: Event, context: EventContext): void {
  // ... 计算新位置

  // 直接修改节点数据
  node.x = newX;
  node.y = newY;

  // 🚀 立即触发渲染
  context.renderer.requestRender();
}
```

**效果**:

- ✅ 跳过 React 状态更新，直接渲染 Canvas
- ✅ 低延迟，高性能
- ✅ 节点实时跟随鼠标

### 4. 拖拽结束最终渲染

```typescript
// src/core/event/nodeDrag.ts - NodeDragEndHandler
handle(_event: Event, context: EventContext): void {
  this.nodeSelectionHandler.stopDragging();
  context.isDragging.current = false;

  // 🔄 最终渲染
  context.renderer.requestRender();
}
```

**作用**: 确保拖拽结束后的状态正确渲染

## 📊 渲染流程对比

### 修改前 (数据更新不触发渲染)

```
用户拖拽 → 修改node.x/y → ❌ 没有渲染调用 → 画面不更新
```

### 修改后 (混合架构)

```
用户拖拽 → 修改node.x/y → renderer.requestRender() → ✅ 实时更新
```

## 🚀 性能优势

### 直接 Canvas 渲染

- **跳过 React**: 不经过 React 状态更新和重渲染流程
- **低延迟**: 事件处理后立即渲染
- **高帧率**: 支持 60fps 的流畅拖拽

### requestAnimationFrame 优化

```typescript
// NodeTreeCanvasRenderer.requestRender() 内部
if (!this.renderRequested) {
  this.renderRequested = true;
  requestAnimationFrame(() => {
    this.performRender();
    this.renderRequested = false;
  });
}
```

**效果**: 自动批量渲染请求，避免重复渲染

## 🔮 未来扩展

### 阶段二：状态同步机制

```typescript
// 拖拽结束后同步到React状态
class NodeDragEndHandler {
  handle(event: Event, context: EventContext): void {
    // ... 停止拖拽

    // 🔄 同步到React状态（未来实现）
    if (context.updateNodeData) {
      const node = this.getUpdatedNode();
      context.updateNodeData(node.id, {
        x: node.x,
        y: node.y,
      });
    }
  }
}
```

### 阶段三：撤销重做支持

```typescript
// 记录拖拽操作到历史栈
const dragCommand = new NodeDragCommand(nodeId, oldPosition, newPosition);
context.commandHistory.push(dragCommand);
```

## ✅ 预期效果

修改完成后，应该看到：

1. **点击节点** → 节点被选中（显示选择框）
2. **拖拽节点** → 节点实时跟随鼠标移动
3. **释放鼠标** → 节点停在新位置
4. **流畅体验** → 60fps 的拖拽动画

## 🧪 测试要点

- [ ] 拖拽响应速度（应该没有明显延迟）
- [ ] 拖拽流畅度（不应该卡顿）
- [ ] 多个节点拖拽
- [ ] 快速拖拽时的稳定性
- [ ] 网格和标尺是否正确显示

这个实现完美结合了性能和架构的优势！🎉
