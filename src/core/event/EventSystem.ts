import EventEmitter from "eventemitter3";
import {
  BaseEvent,
  MouseEvent as CustomMouseEvent,
  KeyboardEvent as CustomKeyboardEvent,
  EventHandler,
  EventResult,
  EventContext,
  EventMiddleware,
  InteractionState,
} from "./types";

/**
 * 事件工厂 - 将原生DOM事件转换为标准化事件
 */
class EventFactory {
  static createMouseEvent(
    nativeEvent: MouseEvent,
    canvas: HTMLCanvasElement,
    transform: (point: { x: number; y: number }) => { x: number; y: number }
  ): CustomMouseEvent {
    const rect = canvas.getBoundingClientRect();
    const point = {
      x: nativeEvent.clientX - rect.left,
      y: nativeEvent.clientY - rect.top,
    };
    const canvasPoint = transform(point);

    return {
      type: this.getMouseEventType(nativeEvent.type),
      timestamp: Date.now(),
      point,
      canvasPoint,
      button: nativeEvent.button,
      buttons: nativeEvent.buttons,
      altKey: nativeEvent.altKey,
      ctrlKey: nativeEvent.ctrlKey,
      metaKey: nativeEvent.metaKey,
      shiftKey: nativeEvent.shiftKey,
      canceled: false,
      propagationStopped: false,
      preventDefault: () => {
        nativeEvent.preventDefault();
      },
      stopPropagation: () => {
        nativeEvent.stopPropagation();
      },
    };
  }

  static createKeyboardEvent(nativeEvent: KeyboardEvent): CustomKeyboardEvent {
    return {
      type: nativeEvent.type === "keydown" ? "key.down" : "key.up",
      timestamp: Date.now(),
      key: nativeEvent.key,
      code: nativeEvent.code,
      altKey: nativeEvent.altKey,
      ctrlKey: nativeEvent.ctrlKey,
      metaKey: nativeEvent.metaKey,
      shiftKey: nativeEvent.shiftKey,
      canceled: false,
      propagationStopped: false,
      preventDefault: () => {
        nativeEvent.preventDefault();
      },
      stopPropagation: () => {
        nativeEvent.stopPropagation();
      },
    };
  }

  private static getMouseEventType(type: string): CustomMouseEvent["type"] {
    switch (type) {
      case "mousedown":
        return "mouse.down";
      case "mousemove":
        return "mouse.move";
      case "mouseup":
        return "mouse.up";
      case "wheel":
        return "mouse.wheel";
      default:
        return "mouse.move";
    }
  }
}

/**
 * 新的事件系统核心管理器
 * 完全独立于React组件生命周期，基于单例模式
 */
export class EventSystem {
  private static instance: EventSystem | null = null;

  private eventEmitter = new EventEmitter();
  private handlers: EventHandler[] = [];
  private middlewares: EventMiddleware[] = [];
  private context: EventContext | null = null;
  private interactionState: InteractionState = "idle";
  private isActive = false;

  // DOM事件监听器引用
  private eventListeners = new Map<HTMLElement, Map<string, EventListener>>();

  private constructor() {
    console.log("🔧 EventSystem 实例创建");
  }

  /**
   * 获取单例实例
   */
  static getInstance(): EventSystem {
    if (!EventSystem.instance) {
      EventSystem.instance = new EventSystem();
    }
    return EventSystem.instance;
  }

  /**
   * 销毁单例（用于测试或重置）
   */
  static destroyInstance(): void {
    if (EventSystem.instance) {
      EventSystem.instance.destroy();
      EventSystem.instance = null;
    }
  }

  /**
   * 初始化事件系统
   */
  initialize(context: EventContext): void {
    if (this.isActive && this.context?.canvas === context.canvas) {
      console.log("⚠️ 事件系统已在同一canvas上激活，跳过重复初始化");
      return;
    }

    console.log("🚀 初始化事件系统");

    // 清理旧的绑定
    this.cleanup();

    // 设置新的上下文
    this.context = context;
    this.interactionState = "idle";

    // 绑定DOM事件
    this.bindDOMEvents(context.canvas);

    this.isActive = true;
    console.log("✅ 事件系统初始化完成");
  }

  /**
   * 绑定DOM事件到Canvas
   */
  private bindDOMEvents(canvas: HTMLCanvasElement): void {
    const listeners = new Map<string, EventListener>();

    // 鼠标事件
    const mouseEvents = ["mousedown", "mousemove", "mouseup", "wheel"];
    mouseEvents.forEach((eventType) => {
      const listener = (e: Event) => this.handleDOMEvent(e as MouseEvent);
      canvas.addEventListener(eventType, listener, { passive: false });
      listeners.set(eventType, listener);
    });

    // 阻止右键菜单
    const contextMenuListener = (e: Event) => {
      e.preventDefault();
    };
    canvas.addEventListener("contextmenu", contextMenuListener);
    listeners.set("contextmenu", contextMenuListener);

    // 键盘事件（绑定到window）
    const keyboardEvents = ["keydown", "keyup"];
    keyboardEvents.forEach((eventType) => {
      const listener = (e: Event) => this.handleDOMEvent(e as KeyboardEvent);
      window.addEventListener(eventType, listener);
      listeners.set(eventType, listener);
    });

    this.eventListeners.set(canvas, listeners);
  }

  /**
   * 处理DOM事件
   */
  private async handleDOMEvent(
    nativeEvent: MouseEvent | KeyboardEvent
  ): Promise<void> {
    if (!this.context || !this.isActive) return;

    let event: BaseEvent;

    // 转换为标准化事件
    if (nativeEvent instanceof MouseEvent) {
      event = EventFactory.createMouseEvent(
        nativeEvent,
        this.context.canvas,
        this.context.transform.screenToCanvas
      );
    } else {
      event = EventFactory.createKeyboardEvent(nativeEvent);
    }

    // 处理事件
    await this.processEvent(event);
  }

  /**
   * 处理事件
   */
  private async processEvent(event: BaseEvent): Promise<void> {
    if (!this.context) return;

    console.log(
      `🎯 处理事件: ${event.type}, 当前状态: ${this.interactionState}`
    );

    try {
      // 通过中间件处理事件
      const result = await this.processMiddlewares(event, 0);

      // 更新交互状态
      if (result.newState && result.newState !== this.interactionState) {
        this.setInteractionState(result.newState);
      }

      // 请求重新渲染
      if (result.requestRender) {
        this.eventEmitter.emit("render:request");
      }

      // 发布事件结果
      this.eventEmitter.emit("event:processed", {
        event,
        result,
        state: this.interactionState,
      });
    } catch (error) {
      console.error("❌ 事件处理失败:", error);
    }
  }

  /**
   * 通过中间件处理事件
   */
  private async processMiddlewares(
    event: BaseEvent,
    index: number
  ): Promise<EventResult> {
    if (index >= this.middlewares.length) {
      // 所有中间件处理完毕，执行核心事件处理
      return this.processCoreEvent(event);
    }

    const middleware = this.middlewares[index];
    const next = () => this.processMiddlewares(event, index + 1);

    return middleware.process(event, this.context!, next);
  }

  /**
   * 核心事件处理
   */
  private async processCoreEvent(event: BaseEvent): Promise<EventResult> {
    if (!this.context) {
      return { handled: false };
    }

    // 找到可以处理此事件的处理器
    const availableHandlers = this.handlers
      .filter((handler) => handler.canHandle(event, this.interactionState))
      .sort((a, b) => b.priority - a.priority);

    for (const handler of availableHandlers) {
      try {
        const result = await Promise.resolve(
          handler.handle(event, this.context)
        );

        if (result.handled) {
          console.log(`✅ 事件被处理器 "${handler.name}" 处理`);
          return result;
        }
      } catch (error) {
        console.error(`❌ 处理器 "${handler.name}" 处理失败:`, error);
      }
    }

    return { handled: false };
  }

  /**
   * 设置交互状态
   */
  private setInteractionState(state: InteractionState): void {
    if (this.interactionState !== state) {
      const oldState = this.interactionState;
      this.interactionState = state;

      console.log(`🔄 交互状态变化: ${oldState} -> ${state}`);

      // 发布状态变化事件
      this.eventEmitter.emit("state:changed", {
        oldState,
        newState: state,
      });
    }
  }

  /**
   * 注册事件处理器
   */
  registerHandler(handler: EventHandler): void {
    // 检查是否已存在同名处理器
    const existingIndex = this.handlers.findIndex(
      (h) => h.name === handler.name
    );
    if (existingIndex >= 0) {
      this.handlers[existingIndex] = handler;
      console.log(`🔄 更新事件处理器: ${handler.name}`);
    } else {
      this.handlers.push(handler);
      console.log(
        `➕ 注册事件处理器: ${handler.name} (优先级: ${handler.priority})`
      );
    }

    // 按优先级排序
    this.handlers.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 移除事件处理器
   */
  unregisterHandler(name: string): void {
    const index = this.handlers.findIndex((h) => h.name === name);
    if (index >= 0) {
      this.handlers.splice(index, 1);
      console.log(`➖ 移除事件处理器: ${name}`);
    }
  }

  /**
   * 注册中间件
   */
  registerMiddleware(middleware: EventMiddleware): void {
    this.middlewares.push(middleware);
    console.log(`🔌 注册中间件: ${middleware.name}`);
  }

  /**
   * 获取事件发射器
   */
  getEventEmitter(): EventEmitter {
    return this.eventEmitter;
  }

  /**
   * 获取当前交互状态
   */
  getInteractionState(): InteractionState {
    return this.interactionState;
  }

  /**
   * 清理所有绑定
   */
  private cleanup(): void {
    if (!this.isActive) return;

    console.log("🧹 清理事件系统绑定");

    // 移除所有DOM事件监听器
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach((listener, eventType) => {
        if (eventType in ["keydown", "keyup"]) {
          window.removeEventListener(eventType, listener);
        } else {
          element.removeEventListener(eventType, listener);
        }
      });
    });

    this.eventListeners.clear();
    this.isActive = false;
  }

  /**
   * 销毁事件系统
   */
  destroy(): void {
    console.log("💥 销毁事件系统");

    this.cleanup();
    this.eventEmitter.removeAllListeners();
    this.handlers = [];
    this.middlewares = [];
    this.context = null;
    this.interactionState = "idle";
  }
}

// 导出全局实例
export const eventSystem = EventSystem.getInstance();
