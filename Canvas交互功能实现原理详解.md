# Canvas 交互功能实现原理详解

## 概述

本文深入分析了一个现代 Canvas 编辑器的四大核心交互功能：**选中**、**画布移动**、**画布缩放**、**元素拖拽**的底层实现原理。整个系统采用了类似 Figma 的设计理念，基于事件驱动架构，通过优先级机制和状态管理实现了复杂而流畅的用户交互体验。

## 系统架构概览

### 核心设计理念

整个交互系统基于以下几个核心原则：

- **事件驱动**: 所有交互都通过统一的事件系统处理
- **处理器模式**: 每个功能模块独立实现为事件处理器(EventHandler)
- **优先级机制**: 不同功能通过优先级决定处理顺序
- **坐标系统统一**: 屏幕坐标与世界坐标的无缝转换
- **状态隔离**: 各功能维护独立状态，避免相互干扰

### 关键组件

```typescript
// 事件处理器接口
interface EventHandler {
  name: string;
  priority: number; // 优先级，数字越高越优先
  canHandle(event: BaseEvent, state: InteractionState): boolean;
  handle(event: BaseEvent, context: EventContext): Promise<EventResult>;
}

// 坐标系统管理器
class CoordinateSystemManager {
  screenToWorld(screenX: number, screenY: number): { x: number; y: number };
  worldToScreen(worldX: number, worldY: number): { x: number; y: number };
  updateViewPosition(deltaX: number, deltaY: number): void;
  updateViewScale(scale: number, centerX?: number, centerY?: number): void;
}
```

## 1. 选中功能实现原理

### 基本架构

- **处理器**: `CanvasSelectionHandler`
- **优先级**: 80
- **状态管理**: `SelectionStore`

### 核心实现机制

#### 1.1 单击选中

```typescript
private handleMouseDown(event: MouseEvent): EventResult {
  // 1. 坐标转换：屏幕坐标 → 世界坐标
  const worldPoint = coordinateSystemManager.screenToWorld(
    event.mousePoint.x,
    event.mousePoint.y
  );

  // 2. 碰撞检测：找到点击位置的节点
  const allNodes = this.getAllRenderableNodes();
  const hitNode = HitTestUtils.findNodeAtPoint(worldPoint, allNodes);

  // 3. 选择逻辑处理
  if (hitNode) {
    if (isMultiSelect) {
      selectionStore.toggleNode(hitNode.id);  // 多选模式：切换
    } else {
      selectionStore.selectNode(hitNode.id);   // 单选模式：替换
    }
  } else {
    selectionStore.clearSelection();           // 点击空白：清除
  }
}
```

#### 1.2 框选实现

框选是最复杂的选择功能，需要处理拖拽检测、实时更新和几何相交判断：

```typescript
// 拖拽检测机制
private handleMouseMove(event: MouseEvent): EventResult {
  // 1. 检查拖拽阈值（避免误触）
  const dx = Math.abs(worldPoint.x - this.selectionStart.x);
  const dy = Math.abs(worldPoint.y - this.selectionStart.y);

  if (dx > this.dragThreshold || dy > this.dragThreshold) {
    this.isDragging = true;  // 开始框选
  }

  // 2. 实时更新选择框
  this.updateSelection(worldPoint);
  return { handled: true, requestRender: true };
}

// 几何相交判断
private isNodeInSelectionBox(node: BaseNode, selectionBox): boolean {
  const nodeLeft = node.x;
  const nodeRight = node.x + node.w;
  const nodeTop = node.y;
  const nodeBottom = node.y + node.h;

  // 矩形相交算法：两个矩形不相交的条件取反
  return !(
    nodeRight < selectionBox.left ||
    nodeLeft > selectionBox.right ||
    nodeBottom < selectionBox.top ||
    nodeTop > selectionBox.bottom
  );
}
```

#### 1.3 碰撞检测算法

支持旋转的精确碰撞检测：

```typescript
static isPointInRectangle(point: {x: number, y: number}, node: BaseNode): boolean {
  if (node.rotation === 0) {
    // 无旋转：简单AABB检测
    return point.x >= node.x && point.x <= node.x + node.w &&
           point.y >= node.y && point.y <= node.y + node.h;
  } else {
    // 有旋转：反向旋转点坐标后检测
    const centerX = node.x + node.w / 2;
    const centerY = node.y + node.h / 2;

    const relativeX = point.x - centerX;
    const relativeY = point.y - centerY;

    // 应用反向旋转矩阵
    const cos = Math.cos(-node.rotation);
    const sin = Math.sin(-node.rotation);

    const rotatedX = relativeX * cos - relativeY * sin;
    const rotatedY = relativeX * sin + relativeY * cos;

    return rotatedX >= -node.w/2 && rotatedX <= node.w/2 &&
           rotatedY >= -node.h/2 && rotatedY <= node.h/2;
  }
}
```

### 特色功能

- **多选支持**: Ctrl/Cmd + 点击切换选择状态
- **全选快捷键**: Ctrl/Cmd + A 选择所有节点
- **快速清除**: ESC 键或点击空白处清除选择
- **智能框选**: 3 像素拖拽阈值避免误触发

## 2. 画布移动实现原理

### 基本架构

- **处理器**: `CanvasPanHandler`
- **优先级**: 110（最高，确保平移优先级）
- **触发条件**: 工具为"hand"或按住空格键

### 核心实现机制

#### 2.1 移动计算

```typescript
private handleMouseMove(event: MouseEvent): EventResult {
  if (!this.isPanning || !this.lastPanPoint) return { handled: false };

  // 1. 计算鼠标移动距离（屏幕坐标系）
  const deltaX = event.mousePoint.x - this.lastPanPoint.x;
  const deltaY = event.mousePoint.y - this.lastPanPoint.y;

  // 2. 直接应用到视图变换矩阵
  coordinateSystemManager.updateViewPosition(deltaX, deltaY);

  // 3. 更新记录点
  this.lastPanPoint = { ...event.mousePoint };

  return { handled: true, requestRender: true };
}
```

#### 2.2 视图变换原理

画布移动本质上是修改视图变换矩阵的平移分量：

```typescript
// ViewManager中的平移更新
updateTranslation(view: ViewInfo, deltaX: number, deltaY: number): ViewInfo {
  const newMatrix = mat3.clone(view.matrix);

  // 在当前矩阵基础上应用平移变换
  mat3.translate(newMatrix, newMatrix, [deltaX, deltaY]);

  return { ...view, matrix: newMatrix };
}
```

#### 2.3 临时平移模式

支持空格键临时启用平移，提供类似 Photoshop 的体验：

```typescript
private handleKeyDown(event: KeyboardEvent): EventResult {
  if (event.key === " " && toolStore.getCurrentTool() !== "hand") {
    this.isTemporaryPanMode = true;
    return { handled: true };
  }
}

private handleKeyUp(event: KeyboardEvent): EventResult {
  if (event.key === " " && this.isTemporaryPanMode) {
    this.isTemporaryPanMode = false;
    this.isPanning = false;
    this.lastPanPoint = null;
  }
}
```

### 性能优化

- **按需渲染**: 只有在实际移动时才触发重新渲染
- **状态管理**: 精确控制平移状态，避免无效操作
- **坐标系解耦**: 平移操作直接作用于视图矩阵，不影响节点世界坐标

## 3. 画布缩放实现原理

### 基本架构

- **处理器**: `CanvasZoomHandler`
- **优先级**: 100
- **支持输入**: 鼠标滚轮、触控板、键盘、手势、多点触控

### 核心实现机制

#### 3.1 多输入源处理

**鼠标滚轮缩放**:

```typescript
private handleWheelZoom(event: MouseEvent): EventResult {
  const nativeEvent = event.nativeEvent as WheelEvent;

  // 1. 检测缩放条件
  const isTouchpadZoom = nativeEvent.ctrlKey;  // 触控板自动设置
  const isModifierKeyZoom = this.keyState.metaKey || this.keyState.ctrlKey;

  if (!isTouchpadZoom && !isModifierKeyZoom) {
    return { handled: false };
  }

  // 2. 区分输入类型，使用不同缩放因子
  let scaleFactor: number;
  if (isTouchpadZoom || Math.abs(nativeEvent.deltaY) < 50) {
    // 触控板精密滚动
    scaleFactor = 1 + (-nativeEvent.deltaY) * 0.008;
  } else {
    // 鼠标滚轮离散滚动
    const zoomMultiplier = 1 + 0.15;
    scaleFactor = nativeEvent.deltaY > 0 ? 1/zoomMultiplier : zoomMultiplier;
  }

  // 3. 以鼠标位置为中心缩放
  const newScale = this.clampScale(currentScale * scaleFactor);
  coordinateSystemManager.updateViewScale(newScale, event.mousePoint.x, event.mousePoint.y);
}
```

**键盘缩放**:

```typescript
private handleKeyDown(event: KeyboardEvent): EventResult {
  if (!this.isZoomShortcut(event)) return { handled: false };

  let newScale: number;
  switch (event.key) {
    case "=":
    case "+":
      newScale = this.clampScale(currentScale + 0.2);  // 放大
      break;
    case "-":
      newScale = this.clampScale(currentScale - 0.2);  // 缩小
      break;
    case "0":
      newScale = 1.0;  // 重置100%
      break;
  }

  // 使用最后记录的鼠标位置或画布中心
  const centerPoint = this.lastMousePosition || {
    x: canvas.width / 2,
    y: canvas.height / 2
  };

  coordinateSystemManager.updateViewScale(newScale, centerPoint.x, centerPoint.y);
}
```

#### 3.2 以点为中心的缩放算法

关键是在缩放时保持指定点在屏幕上的位置不变：

```typescript
updateScale(view: ViewInfo, scale: number, centerX?: number, centerY?: number): ViewInfo {
  let newMatrix = mat3.clone(view.matrix);

  if (centerX !== undefined && centerY !== undefined) {
    // 1. 平移到以缩放中心为原点
    mat3.translate(newMatrix, newMatrix, [centerX, centerY]);

    // 2. 应用缩放
    const currentScale = this.getCurrentScale(view);
    const scaleRatio = scale / currentScale;
    mat3.scale(newMatrix, newMatrix, [scaleRatio, scaleRatio]);

    // 3. 平移回原来的位置
    mat3.translate(newMatrix, newMatrix, [-centerX, -centerY]);
  } else {
    // 简单缩放（以原点为中心）
    const currentScale = this.getCurrentScale(view);
    const scaleRatio = scale / currentScale;
    mat3.scale(newMatrix, newMatrix, [scaleRatio, scaleRatio]);
  }

  return { ...view, matrix: newMatrix };
}
```

#### 3.3 手势和触控支持

**Safari 手势事件**:

```typescript
private handleGestureZoom(event: GestureEvent): EventResult {
  switch (event.type) {
    case "gesture.start":
      this.gestureState.initialScale = this.getCurrentScale();
      this.gestureState.lastScale = event.scale;
      break;

    case "gesture.change":
      const scaleDelta = event.scale / this.gestureState.lastScale;
      const newScale = this.clampScale(currentScale * scaleDelta);
      coordinateSystemManager.updateViewScale(
        newScale,
        event.centerPoint.x,
        event.centerPoint.y
      );
      this.gestureState.lastScale = event.scale;
      break;
  }
}
```

**多点触控缩放**:

```typescript
private handleTouchZoom(event: TouchEvent): EventResult {
  if (event.touches.length < 2) return { handled: false };

  const touch1 = event.touches[0];
  const touch2 = event.touches[1];

  // 计算两点间距离
  const distance = Math.sqrt(
    Math.pow(touch2.x - touch1.x, 2) + Math.pow(touch2.y - touch1.y, 2)
  );

  // 计算中心点
  const centerX = (touch1.x + touch2.x) / 2;
  const centerY = (touch1.y + touch2.y) / 2;

  if (event.type === "touch.move" && this.touchState.lastDistance > 0) {
    const scaleFactor = distance / this.touchState.lastDistance;
    const newScale = this.clampScale(currentScale * scaleFactor);
    coordinateSystemManager.updateViewScale(newScale, centerX, centerY);
  }

  this.touchState.lastDistance = distance;
}
```

### 智能特性

- **输入类型识别**: 自动区分触控板、鼠标滚轮、手势等不同输入
- **缩放范围限制**: 0.1x - 10x 的合理缩放范围
- **流畅性优化**: 触控板使用更小的缩放步长，鼠标滚轮使用更大步长
- **中心点记忆**: 键盘缩放时记住最后的鼠标位置

## 4. 元素拖拽实现原理

### 基本架构

- **处理器**: `CanvasDragHandler`
- **优先级**: 90（介于选择和缩放之间，确保拖拽优先于选择）
- **协作机制**: 与选择处理器协调工作

### 核心实现机制

#### 4.1 拖拽条件判断

只有在选中节点上开始的拖拽才会被处理：

```typescript
private handleMouseDown(event: MouseEvent): EventResult {
  const worldPoint = coordinateSystemManager.screenToWorld(
    event.mousePoint.x,
    event.mousePoint.y
  );

  // 1. 检查是否有选中节点
  const selectedIds = selectionStore.getSelectedNodeIds();
  if (selectedIds.length === 0) {
    return { handled: false };  // 没有选中节点，不处理
  }

  // 2. 检查点击位置是否在选中节点上
  const hitSelectedNode = this.checkHitSelectedNode(worldPoint, selectedIds);

  if (hitSelectedNode) {
    // 在选中节点上，准备拖拽
    this.startDrag(worldPoint, selectedIds);
    return { handled: true };  // 阻止选择处理器处理
  }

  return { handled: false };  // 让选择处理器处理
}
```

#### 4.2 多节点同步拖拽

支持同时拖拽多个选中的节点：

```typescript
private startDrag(worldPoint: {x: number, y: number}, selectedIds: string[]): void {
  this.dragStartPoint = { ...worldPoint };

  // 记录所有选中节点的原始位置
  this.draggedNodes = selectedIds.map(nodeId => {
    const node = nodeTree.getNodeById(nodeId) as BaseNode;
    return {
      id: nodeId,
      originalX: node.x,
      originalY: node.y,
      currentX: node.x,
      currentY: node.y,
    };
  });
}

private updateDrag(worldPoint: {x: number, y: number}): void {
  // 计算拖拽偏移量
  const deltaX = worldPoint.x - this.dragStartPoint.x;
  const deltaY = worldPoint.y - this.dragStartPoint.y;

  // 同步更新所有拖拽节点的位置
  this.draggedNodes.forEach(draggedNode => {
    const newX = draggedNode.originalX + deltaX;
    const newY = draggedNode.originalY + deltaY;

    draggedNode.currentX = newX;
    draggedNode.currentY = newY;

    // 更新节点状态
    const node = nodeTree.getNodeById(draggedNode.id) as BaseNode;
    node.x = newX;
    node.y = newY;
  });
}
```

#### 4.3 拖拽阈值机制

避免微小鼠标移动被误判为拖拽：

```typescript
private handleMouseMove(event: MouseEvent): EventResult {
  if (!this.dragStartPoint) return { handled: false };

  const worldPoint = coordinateSystemManager.screenToWorld(
    event.mousePoint.x,
    event.mousePoint.y
  );

  // 检查是否超过拖拽阈值
  if (!this.isDragging) {
    const dx = Math.abs(worldPoint.x - this.dragStartPoint.x);
    const dy = Math.abs(worldPoint.y - this.dragStartPoint.y);

    if (dx > this.dragThreshold || dy > this.dragThreshold) {
      this.isDragging = true;  // 开始真正的拖拽
    } else {
      return { handled: true };  // 阻止事件传播但不处理
    }
  }

  if (this.isDragging) {
    this.updateDrag(worldPoint);
    return { handled: true, requestRender: true };
  }
}
```

#### 4.4 与选择系统的协调

通过优先级和处理结果协调两个系统：

```typescript
private handleMouseUp(event: MouseEvent): EventResult {
  if (!this.dragStartPoint) return { handled: false };

  if (this.isDragging) {
    // 发生了实际拖拽
    this.finishDrag();
    return { handled: true, requestRender: true };
  } else {
    // 没有拖拽，让选择处理器处理点击选择
    this.resetDrag();
    return { handled: false };
  }
}
```

### 拖拽特色功能

- **智能启动**: 只有在选中节点上开始才启动拖拽
- **多节点支持**: 可以同时拖拽多个选中节点
- **拖拽阈值**: 3 像素阈值避免误触发
- **实时更新**: 拖拽过程中实时更新节点位置和视觉反馈
- **状态协调**: 与选择系统智能协调，避免冲突

## 系统特色与亮点

### 1. 优先级机制

通过精心设计的优先级避免功能冲突：

- **CanvasPanHandler**: 110（最高）- 确保平移优先
- **CanvasZoomHandler**: 100 - 缩放次之
- **CanvasDragHandler**: 90 - 拖拽第三
- **CanvasSelectionHandler**: 80 - 选择最后

### 2. 坐标系统统一

所有交互都基于统一的坐标转换系统：

- **屏幕坐标**: UI 事件的原始坐标
- **世界坐标**: 节点的逻辑坐标
- **自动转换**: 处理器自动处理坐标转换

### 3. 状态隔离

每个功能维护独立状态，避免相互干扰：

- 选择状态 → `SelectionStore`
- 拖拽状态 → `CanvasDragHandler`内部状态
- 视图状态 → `CoordinateSystemManager`
- 工具状态 → `ToolStore`

### 4. 性能优化

- **按需渲染**: 只有在必要时才触发重新渲染
- **事件去重**: 避免重复处理相同事件
- **状态缓存**: 避免重复计算坐标变换
- **智能检测**: 通过阈值避免微小移动的处理

### 5. 跨平台兼容

- **多输入源**: 支持鼠标、触控板、触摸屏、键盘
- **浏览器兼容**: 处理不同浏览器的事件差异
- **设备适配**: 自动识别输入设备类型

## 总结

这个 Canvas 交互系统通过精心设计的架构实现了专业级的用户体验：

1. **架构清晰**: 事件驱动 + 处理器模式 + 优先级机制
2. **功能完整**: 涵盖选中、移动、缩放、拖拽的完整交互链
3. **性能优化**: 智能渲染、状态管理、坐标缓存
4. **体验出色**: 拖拽阈值、多输入支持、智能协调
5. **扩展性强**: 模块化设计，易于添加新功能

整个系统的设计充分体现了现代前端工程的最佳实践，为构建复杂的 Canvas 应用提供了优秀的参考范例。无论是在交互设计、性能优化还是代码架构方面，都展现了专业的技术水准。
