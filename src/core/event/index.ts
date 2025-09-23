// 导出事件管理器
export { EventManager, globalEventManager } from "../manage/EventManager";
import { globalEventManager } from "../manage/EventManager";
export type { IEventHandler, EventContext } from "../manage/EventManager";

// 导出具体的事件处理器
export { MouseMoveHandler } from "./mouseMove";
export { MouseUpHandler } from "./mouseUp";
export { WheelHandler } from "./wheelHandler";
export { NodeSelectionHandler } from "./nodeSelection";
export { NodeDragHandler, NodeDragEndHandler } from "./nodeDrag";
export { MouseDownHandler } from "./mouseDown";
export type { IMouseDownSubHandler } from "./mouseDown";
export { NodeCreationHandler } from "./nodeCreation";
export { DragCreationHandler, DragCreationEndHandler } from "./dragCreation";

// 导出事件处理器工厂函数
import { MouseMoveHandler } from "./mouseMove";
import { MouseUpHandler } from "./mouseUp";
import { WheelHandler } from "./wheelHandler";
import { NodeSelectionHandler } from "./nodeSelection";
import { NodeDragHandler, NodeDragEndHandler } from "./nodeDrag";
import { MouseDownHandler } from "./mouseDown";
import { NodeCreationHandler } from "./nodeCreation";
import { DragCreationHandler, DragCreationEndHandler } from "./dragCreation";
import { IEventHandler } from "../manage/EventManager";

// 创建节点选择处理器实例（需要在其他处理器中共享）
const nodeSelectionHandler = new NodeSelectionHandler();

// 创建节点创建处理器实例
const nodeCreationHandler = new NodeCreationHandler();

// 创建主mousedown处理器并注册子处理器
const mouseDownHandler = new MouseDownHandler();
mouseDownHandler.registerSubHandler(nodeCreationHandler); // 节点创建优先级更高
mouseDownHandler.registerSubHandler(nodeSelectionHandler); // 节点选择作为fallback

/**
 * 创建所有内置事件处理器
 */
export function createBuiltinEventHandlers(): IEventHandler[] {
  return [
    mouseDownHandler, // 主mousedown处理器（包含子处理器分发逻辑）
    new MouseMoveHandler(),
    new DragCreationHandler(nodeCreationHandler), // 拖拽创建预览
    new MouseUpHandler(),
    new DragCreationEndHandler(nodeCreationHandler), // 拖拽创建结束
    new WheelHandler(),
    new NodeDragHandler(nodeSelectionHandler),
    new NodeDragEndHandler(nodeSelectionHandler),
  ];
}

// 导出处理器实例供外部使用
export { nodeSelectionHandler, nodeCreationHandler, mouseDownHandler };

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
    globalEventManager.register(handler);
  });

  // 标记为已初始化
  globalEventManager.markInitialized();

  console.log("事件系统已初始化", {
    registeredHandlers: globalEventManager.getRegisteredHandlerNames(),
    nativeEventTypes: globalEventManager.getRegisteredNativeEventTypes(),
  });
}
