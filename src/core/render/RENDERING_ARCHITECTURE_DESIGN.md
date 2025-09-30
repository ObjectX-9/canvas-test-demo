# 渲染架构设计：数据驱动 vs 事件驱动

## 🤔 架构选择问题

当前面临的问题：**节点数据更新后，渲染器没有重新渲染**

需要决定采用哪种渲染触发机制？

## 📊 方案对比分析

### 1️⃣ 数据驱动渲染 (Data-driven Rendering)

```typescript
// React状态变化 → 自动触发渲染
const [nodeData, setNodeData] = useState(nodes);

// 节点更新
const updateNode = (id: string, changes: Partial<BaseNode>) => {
  setNodeData((prev) =>
    prev.map((node) => (node.id === id ? { ...node, ...changes } : node))
  );
  // ✅ React自动触发重渲染
};
```

#### ✅ 优点

- **React 哲学**: 符合单向数据流，状态驱动 UI
- **自动同步**: 数据变化自动触发渲染，不会遗漏
- **易于调试**: 状态变化清晰可追踪
- **撤销重做**: 天然支持历史状态管理
- **实时协作**: 状态变化可以轻松广播给其他用户
- **时间旅行**: 支持状态快照和回放

#### ❌ 缺点

- **性能开销**: 每次更新都经过 React 渲染流程
- **状态复杂**: 需要设计状态管理架构

---

### 2️⃣ 事件驱动渲染 (Event-driven Rendering)

```typescript
// 事件处理器直接触发渲染
class NodeDragHandler {
  handle(event: Event, context: EventContext): void {
    // 直接修改节点数据
    node.x = newX;
    node.y = newY;

    // ✅ 手动触发渲染
    context.renderer.requestRender();
  }
}
```

#### ✅ 优点

- **高性能**: 跳过 React，直接渲染 Canvas
- **低延迟**: 事件处理器立即触发渲染
- **精确控制**: 可以控制何时渲染、渲染什么

#### ❌ 缺点

- **容易遗漏**: 忘记调用`requestRender()`导致 UI 不同步
- **调试困难**: 状态变化不透明，难以追踪
- **状态不一致**: 直接修改数据可能导致状态问题
- **难以扩展**: 不支持撤销重做、协作等高级功能

---

## 🎯 推荐方案：混合架构

### 核心思路

- **主流程**: 数据驱动渲染（确保状态一致性）
- **优化路径**: 事件驱动渲染（提升交互性能）
- **最终同步**: 操作结束时同步到 React 状态

### 实现策略

#### 1. 高频交互优化（拖拽过程中）

```typescript
class NodeDragHandler {
  handle(event: Event, context: EventContext): void {
    // 🚀 实时更新：直接修改+立即渲染
    node.x = newX;
    node.y = newY;
    context.renderer.requestRender(); // 高性能路径

    // 不立即同步到React状态（避免高频更新）
  }
}

class NodeDragEndHandler {
  handle(event: Event, context: EventContext): void {
    // 🔄 最终同步：同步到React状态
    context.updateNodeData(draggingNodeId, {
      x: node.x,
      y: node.y,
    });
    // React状态更新后会自动重渲染（确保数据一致性）
  }
}
```

#### 2. 普通操作（创建、删除、属性修改）

```typescript
// 直接使用React状态管理
const createNode = (nodeData: Partial<BaseNode>) => {
  setNodes((prev) => [...prev, new BaseNode(nodeData)]);
  // ✅ React自动触发重渲染
};
```

## 🏗️ 具体实现方案

### 第一阶段：修复当前问题

```typescript
// 1. EventContext中加入渲染器引用
interface EventContext {
  // ... 现有属性
  renderer: NodeTreeCanvasRenderer; // 新增
}

// 2. 事件处理器中触发渲染
class NodeDragHandler {
  handle(event: Event, context: EventContext): void {
    // 更新节点
    node.x = newX;
    node.y = newY;

    // 👆 立即渲染（性能优化）
    context.renderer.requestRender();
  }
}
```

### 第二阶段：完善状态管理

```typescript
// 1. 设计状态更新接口
interface EventContext {
  // ... 现有属性
  updateNodeData: (id: string, changes: Partial<BaseNode>) => void;
}

// 2. 操作结束时同步状态
class NodeDragEndHandler {
  handle(event: Event, context: EventContext): void {
    this.nodeSelectionHandler.stopDragging();

    // 🔄 同步到React状态
    const node = this.getUpdatedNode();
    context.updateNodeData(node.id, {
      x: node.x,
      y: node.y,
    });
  }
}
```

## 📈 性能对比

| 场景       | 数据驱动   | 事件驱动   | 混合方案   |
| ---------- | ---------- | ---------- | ---------- |
| 拖拽流畅度 | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 状态一致性 | ⭐⭐⭐⭐⭐ | ⭐⭐       | ⭐⭐⭐⭐⭐ |
| 开发复杂度 | ⭐⭐⭐⭐   | ⭐⭐⭐     | ⭐⭐⭐     |
| 可维护性   | ⭐⭐⭐⭐⭐ | ⭐⭐       | ⭐⭐⭐⭐   |
| 扩展性     | ⭐⭐⭐⭐⭐ | ⭐⭐       | ⭐⭐⭐⭐⭐ |

## 🎉 结论

**推荐混合架构**：

- ✅ 保持 React 数据驱动的核心优势
- ✅ 在关键交互路径上优化性能
- ✅ 确保状态最终一致性
- ✅ 为未来功能扩展奠定基础

**下一步行动**：

1. 修复 EventContext，加入 renderer 引用
2. 在拖拽事件中加入`requestRender()`调用
3. 测试拖拽流畅度
4. (可选) 实现状态同步机制
