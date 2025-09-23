import { IEventHandler, EventContext } from "../manage/EventManager";

/**
 * 鼠标抬起事件处理器
 */
export class MouseUpHandler implements IEventHandler {
  readonly type = "drag-end";
  readonly nativeEventType = "mouseup";

  canHandle(event: Event): boolean {
    return event.type === this.nativeEventType;
  }

  handle(_event: Event, context: EventContext): void {
    const { isDragging } = context;

    // 停止拖拽
    isDragging.current = false;
  }
}
