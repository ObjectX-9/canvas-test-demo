import { IEventHandler, EventContext } from "../manage/EventManager";

/**
 * 鼠标抬起事件处理器
 */
export class MouseUpHandler implements IEventHandler {
  readonly type = "mouseup";

  canHandle(event: Event): boolean {
    return event.type === "mouseup";
  }

  handle(_event: Event, context: EventContext): void {
    const { isDragging } = context;

    // 停止拖拽
    isDragging.current = false;
  }
}
