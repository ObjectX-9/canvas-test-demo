import { EventSystem } from "./EventSystem";

import { EventContext } from "./types";
import { CanvasPanHandler } from "./handlers";

/**
 * 事件系统初始化器
 * 负责设置和配置整个事件系统
 */
export class EventSystemInitializer {
  private eventSystem: EventSystem;
  private isInitialized = false;

  constructor() {
    this.eventSystem = EventSystem.getInstance();
  }

  /**
   * 初始化事件系统
   */
  initialize(canvas: HTMLCanvasElement): void {
    if (this.isInitialized) {
      return;
    }

    // 注册中间件（按执行顺序）
    this.registerMiddlewares();

    // 注册事件处理器
    this.registerHandlers();

    // 构建事件上下文
    const context = this.buildEventContext(canvas);

    // 初始化事件系统
    this.eventSystem.initialize(context);

    this.isInitialized = true;
  }

  /**
   * 注册中间件
   */
  private registerMiddlewares(): void {
    //
  }

  /**
   * 注册事件处理器
   */
  private registerHandlers(): void {
    // 按优先级注册处理器（优先级高的先执行）
    this.eventSystem.registerHandler(new CanvasPanHandler()); // 110
  }

  /**
   * 构建事件上下文
   */
  private buildEventContext(canvas: HTMLCanvasElement): EventContext {
    return {
      canvas,
      interactionState: "idle",
      currentTool: "select",
    };
  }

  /**
   * 获取事件系统实例
   */
  getEventSystem(): EventSystem {
    return this.eventSystem;
  }

  /**
   * 销毁事件系统
   */
  destroy(): void {
    this.eventSystem.destroy();
    this.isInitialized = false;
  }
}
