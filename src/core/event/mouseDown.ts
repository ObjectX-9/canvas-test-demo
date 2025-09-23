import { IEventHandler, EventContext } from "../manage/EventManager";

/**
 * 鼠标按下事件处理器
 */
export class MouseDownHandler implements IEventHandler {
  readonly type = "mousedown";

  canHandle(event: Event): boolean {
    return event.type === "mousedown";
  }

  handle(event: Event, context: EventContext): void {
    const mouseEvent = event as MouseEvent;
    const { isDragging, lastMousePosition } = context;

    // 开始拖拽
    isDragging.current = true;
    lastMousePosition.current = {
      x: mouseEvent.clientX,
      y: mouseEvent.clientY,
    };
  }
}
