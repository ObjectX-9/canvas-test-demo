import { Page } from "../nodeTree/node/page";
import { ViewType } from "../types";

/**
 * 事件上下文接口
 * 包含事件处理所需的所有状态和依赖
 */
export interface EventContext {
  canvas: HTMLCanvasElement;
  currentPage: Page | null;
  viewState: ViewType;
  isDragging: React.MutableRefObject<boolean>;
  lastMousePosition: React.MutableRefObject<{ x: number; y: number }>;
  setViewState: (state: ViewType) => void;
  setZoomIndicator: (zoom: string) => void;
}

/**
 * 事件处理器接口
 */
export interface IEventHandler {
  readonly type: string;
  canHandle(event: Event): boolean;
  handle(event: Event, context: EventContext): void;
}

/**
 * 事件管理器
 * 负责注册和分发画布事件到具体的处理器
 */
export class EventManager {
  private handlers: Map<string, IEventHandler[]> = new Map();
  private context: EventContext | null = null;
  private initialized: boolean = false;
  private boundEventListeners: Map<
    HTMLCanvasElement,
    {
      mousedown: (e: Event) => void;
      mousemove: (e: Event) => void;
      mouseup: (e: Event) => void;
      wheel: (e: Event) => void;
    }
  > = new Map();

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 标记为已初始化
   */
  markInitialized(): void {
    this.initialized = true;
  }

  /**
   * 设置事件上下文
   */
  setContext(context: EventContext): void {
    this.context = context;
  }

  /**
   * 注册事件处理器
   */
  register(eventType: string, handler: IEventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * 注销事件处理器
   */
  unregister(eventType: string, handler: IEventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 处理事件
   */
  handleEvent(eventType: string, event: Event): void {
    if (!this.context) {
      console.warn("事件上下文未设置");
      return;
    }

    const handlers = this.handlers.get(eventType);
    if (!handlers || handlers.length === 0) {
      console.warn(`未找到 ${eventType} 事件的处理器`);
      return;
    }

    // 按注册顺序执行处理器
    for (const handler of handlers) {
      if (handler.canHandle(event)) {
        try {
          handler.handle(event, this.context);
        } catch (error) {
          console.error(`事件处理器 ${handler.type} 执行出错:`, error);
        }
      }
    }
  }

  /**
   * 获取已注册的事件类型
   */
  getRegisteredEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * 清空所有处理器
   */
  clear(): void {
    this.handlers.clear();
  }

  /**
   * 绑定画布事件监听器
   */
  bindCanvasEvents(canvas: HTMLCanvasElement): void {
    // 如果已经绑定过，先解绑
    if (this.boundEventListeners.has(canvas)) {
      this.unbindCanvasEvents(canvas);
    }

    // 创建事件监听器
    const listeners = {
      mousedown: (e: Event) => this.handleEvent("mousedown", e),
      mousemove: (e: Event) => this.handleEvent("mousemove", e),
      mouseup: (e: Event) => this.handleEvent("mouseup", e),
      wheel: (e: Event) => this.handleEvent("wheel", e),
    };

    // 绑定事件
    canvas.addEventListener("mousedown", listeners.mousedown);
    canvas.addEventListener("mousemove", listeners.mousemove);
    canvas.addEventListener("mouseup", listeners.mouseup);
    canvas.addEventListener("wheel", listeners.wheel);

    // 保存监听器引用
    this.boundEventListeners.set(canvas, listeners);
  }

  /**
   * 解绑画布事件监听器
   */
  unbindCanvasEvents(canvas: HTMLCanvasElement): void {
    const listeners = this.boundEventListeners.get(canvas);
    if (listeners) {
      canvas.removeEventListener("mousedown", listeners.mousedown);
      canvas.removeEventListener("mousemove", listeners.mousemove);
      canvas.removeEventListener("mouseup", listeners.mouseup);
      canvas.removeEventListener("wheel", listeners.wheel);

      this.boundEventListeners.delete(canvas);
    }
  }
}

// 导出全局事件管理器实例
export const globalEventManager = new EventManager();
