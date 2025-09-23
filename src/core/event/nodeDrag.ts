import { IEventHandler, EventContext } from "../manage/EventManager";
import { nodeTree } from "../nodeTree";
import { NodeSelectionHandler } from "./nodeSelection";

/**
 * 节点拖拽事件处理器
 * 处理节点移动的逻辑
 */
export class NodeDragHandler implements IEventHandler {
  readonly type = "node-drag";
  readonly nativeEventType = "mousemove";
  private nodeSelectionHandler: NodeSelectionHandler;

  constructor(nodeSelectionHandler: NodeSelectionHandler) {
    this.nodeSelectionHandler = nodeSelectionHandler;
  }

  canHandle(event: Event): boolean {
    return (
      event.type === this.nativeEventType &&
      this.nodeSelectionHandler.isDragging()
    );
  }

  handle(event: Event, context: EventContext): void {
    const mouseEvent = event as MouseEvent;
    const { canvas, coordinateSystemManager } = context;

    if (!this.nodeSelectionHandler.isDragging()) return;

    const draggingNodeId = this.nodeSelectionHandler.getDraggingNodeId();
    if (!draggingNodeId) return;

    // 获取鼠标在canvas中的位置
    const rect = canvas.getBoundingClientRect();
    const canvasX = mouseEvent.clientX - rect.left;
    const canvasY = mouseEvent.clientY - rect.top;

    // 转换为世界坐标
    const worldPoint = coordinateSystemManager.screenToWorld(canvasX, canvasY);

    // 获取拖拽偏移
    const dragOffset = this.nodeSelectionHandler.getDragOffset();

    // 计算新位置
    const newX = worldPoint.x - dragOffset.x;
    const newY = worldPoint.y - dragOffset.y;

    // 更新节点位置
    const node = nodeTree.getNodeById(draggingNodeId);
    if (node) {
      node.x = newX;
      node.y = newY;

      // 触发重新渲染
      // 这里可以添加渲染队列或者直接触发重绘
    }
  }
}

/**
 * 节点拖拽结束处理器
 */
export class NodeDragEndHandler implements IEventHandler {
  readonly type = "node-drag-end";
  readonly nativeEventType = "mouseup";
  private nodeSelectionHandler: NodeSelectionHandler;

  constructor(nodeSelectionHandler: NodeSelectionHandler) {
    this.nodeSelectionHandler = nodeSelectionHandler;
  }

  canHandle(event: Event): boolean {
    return (
      event.type === this.nativeEventType &&
      this.nodeSelectionHandler.isDragging()
    );
  }

  handle(_event: Event, context: EventContext): void {
    // 停止拖拽
    this.nodeSelectionHandler.stopDragging();

    // 重置视图拖拽状态
    context.isDragging.current = false;
  }
}
