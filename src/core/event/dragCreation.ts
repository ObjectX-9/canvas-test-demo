import { IEventHandler, EventContext } from "../manage/EventManager";
import { creationStore } from "../store/CreationStore";
import { NodeCreationHandler } from "./nodeCreation";

/**
 * 拖拽创建处理器
 * 在mousemove时更新拖拽创建的预览
 */
export class DragCreationHandler implements IEventHandler {
  readonly type = "drag-creation-preview";
  readonly nativeEventType = "mousemove";
  private nodeCreationHandler: NodeCreationHandler;

  constructor(nodeCreationHandler: NodeCreationHandler) {
    this.nodeCreationHandler = nodeCreationHandler;
  }

  canHandle(event: Event): boolean {
    return (
      event.type === this.nativeEventType &&
      creationStore.isDragCreateMode() &&
      this.nodeCreationHandler.isDragCreating()
    );
  }

  handle(event: Event, context: EventContext): void {
    const mouseEvent = event as MouseEvent;
    this.nodeCreationHandler.updateDragPreview(mouseEvent, context);
  }
}

/**
 * 拖拽创建结束处理器
 * 在mouseup时完成拖拽创建
 */
export class DragCreationEndHandler implements IEventHandler {
  readonly type = "drag-creation-end";
  readonly nativeEventType = "mouseup";
  private nodeCreationHandler: NodeCreationHandler;

  constructor(nodeCreationHandler: NodeCreationHandler) {
    this.nodeCreationHandler = nodeCreationHandler;
  }

  canHandle(event: Event): boolean {
    return (
      event.type === this.nativeEventType &&
      this.nodeCreationHandler.isDragCreating()
    );
  }

  handle(_event: Event, context: EventContext): void {
    // 完成拖拽创建
    this.nodeCreationHandler.finishDragCreation();

    // 停止拖拽状态
    context.isDragging.current = false;
  }
}
