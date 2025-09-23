import { IEventHandler, EventContext } from "../manage/EventManager";

/**
 * 鼠标按下事件子处理器接口
 */
export interface IMouseDownSubHandler {
  readonly name: string;
  canHandle(event: MouseEvent, context: EventContext): boolean;
  handle(event: MouseEvent, context: EventContext): boolean; // 返回true表示已处理，停止后续处理器
}

/**
 * 主鼠标按下事件处理器
 * 统一接收mousedown事件，然后分发给具体的子处理器
 */
export class MouseDownHandler implements IEventHandler {
  readonly type = "mouse-down";
  readonly nativeEventType = "mousedown";

  private subHandlers: IMouseDownSubHandler[] = [];

  canHandle(event: Event): boolean {
    return event.type === this.nativeEventType;
  }

  /**
   * 注册子处理器
   */
  registerSubHandler(subHandler: IMouseDownSubHandler): void {
    this.subHandlers.push(subHandler);
  }

  /**
   * 注销子处理器
   */
  unregisterSubHandler(subHandler: IMouseDownSubHandler): void {
    const index = this.subHandlers.indexOf(subHandler);
    if (index > -1) {
      this.subHandlers.splice(index, 1);
    }
  }

  handle(event: Event, context: EventContext): void {
    const mouseEvent = event as MouseEvent;

    // 按注册顺序执行子处理器
    for (const subHandler of this.subHandlers) {
      if (subHandler.canHandle(mouseEvent, context)) {
        try {
          const handled = subHandler.handle(mouseEvent, context);
          if (handled) {
            console.log(`mousedown事件被 ${subHandler.name} 处理`);
            return; // 事件已被处理，停止后续处理器
          }
        } catch (error) {
          console.error(`子处理器 ${subHandler.name} 执行出错:`, error);
        }
      }
    }

    // 如果没有子处理器处理该事件，执行默认行为（启动画布拖拽）
    this.handleDefaultBehavior(mouseEvent, context);
  }

  /**
   * 默认行为：启动画布拖拽
   */
  private handleDefaultBehavior(
    mouseEvent: MouseEvent,
    context: EventContext
  ): void {
    console.log("执行默认mousedown行为：启动画布拖拽");

    // 启动画布拖拽
    context.isDragging.current = true;
    context.lastMousePosition.current = {
      x: mouseEvent.clientX,
      y: mouseEvent.clientY,
    };
  }
}
