// 导出事件管理器
export { EventManager, globalEventManager } from "./EventManager";
import { globalEventManager } from "./EventManager";
export type { IEventHandler, EventContext } from "./EventManager";

// 导出具体的事件处理器
export { MouseDownHandler } from "./mouseDown";
export { MouseMoveHandler } from "./mouseMove";
export { MouseUpHandler } from "./mouseUp";
export { WheelHandler } from "./wheelHandler";

// 导出事件处理器工厂函数
import { MouseDownHandler } from "./mouseDown";
import { MouseMoveHandler } from "./mouseMove";
import { MouseUpHandler } from "./mouseUp";
import { WheelHandler } from "./wheelHandler";
import { IEventHandler } from "./EventManager";

/**
 * 创建所有内置事件处理器
 */
export function createBuiltinEventHandlers(): IEventHandler[] {
  return [
    new MouseDownHandler(),
    new MouseMoveHandler(),
    new MouseUpHandler(),
    new WheelHandler(),
  ];
}

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
