// 导出事件管理器
export { EventManager, globalEventManager } from "./EventManager";
import { globalEventManager } from "./EventManager";
export type { IEventHandler, EventContext } from "./EventManager";

// 导出具体的事件处理器
export { MouseMoveHandler } from "./mouseMove";
export { MouseUpHandler } from "./mouseUp";
export { WheelHandler } from "./wheelHandler";
export { NodeSelectionHandler } from "./nodeSelection";
export { NodeDragHandler, NodeDragEndHandler } from "./nodeDrag";

// 导出事件处理器工厂函数
import { MouseMoveHandler } from "./mouseMove";
import { MouseUpHandler } from "./mouseUp";
import { WheelHandler } from "./wheelHandler";
import { NodeSelectionHandler } from "./nodeSelection";
import { NodeDragHandler, NodeDragEndHandler } from "./nodeDrag";
import { IEventHandler } from "./EventManager";

// 创建节点选择处理器实例（需要在其他处理器中共享）
const nodeSelectionHandler = new NodeSelectionHandler();

/**
 * 创建所有内置事件处理器
 */
export function createBuiltinEventHandlers(): IEventHandler[] {
  return [
    nodeSelectionHandler, // 节点选择处理器（包含视图拖拽逻辑）
    new MouseMoveHandler(),
    new MouseUpHandler(),
    new WheelHandler(),
    new NodeDragHandler(nodeSelectionHandler),
    new NodeDragEndHandler(nodeSelectionHandler),
  ];
}

// 导出节点选择处理器供外部使用
export { nodeSelectionHandler };

/**
 * 初始化事件系统
 * 注册所有内置事件处理器
 */
export function initializeEventSystem(): void {
  // 检查是否已经初始化
  if (globalEventManager.isInitialized()) {
    return;
  }

  // 注册内置事件处理器
  const handlers = createBuiltinEventHandlers();

  handlers.forEach((handler) => {
    globalEventManager.register(handler.type, handler);
  });

  // 标记为已初始化
  globalEventManager.markInitialized();

  console.log("事件系统已初始化", {
    registeredTypes: globalEventManager.getRegisteredEventTypes(),
  });
}
