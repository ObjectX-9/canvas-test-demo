import { IEventHandler, EventContext } from "./EventManager";
import { coordinateSystemManager } from "../manage";
import { globalDataObserver } from "../render";
import { nodeTree } from "../nodeTree";
import { BaseNode } from "../nodeTree/node/baseNode";

// 悬停节点的全局状态
let hoveredNode: BaseNode | undefined;

/**
 * 鼠标移动事件处理器
 */
export class MouseMoveHandler implements IEventHandler {
  readonly type = "mousemove";

  canHandle(event: Event): boolean {
    return event.type === "mousemove";
  }

  handle(event: Event, context: EventContext): void {
    const mouseEvent = event as MouseEvent;
    const { isDragging } = context;

    // 处理画布拖拽
    if (isDragging.current) {
      this.handleCanvasDrag(mouseEvent, context);
    }

    // 处理节点悬停检测
    this.handleNodeHover(mouseEvent);
  }

  /**
   * 处理画布拖拽
   */
  private handleCanvasDrag(event: MouseEvent, context: EventContext): void {
    const { lastMousePosition, currentPage, setViewState } = context;

    const deltaX = event.clientX - lastMousePosition.current.x;
    const deltaY = event.clientY - lastMousePosition.current.y;

    // 使用坐标系统管理器更新视图位置
    coordinateSystemManager.updateViewPosition(deltaX, deltaY);
    const updatedView = coordinateSystemManager.getViewState();
    setViewState(updatedView);

    // 同步视图状态到当前页面
    if (currentPage) {
      currentPage.panX = updatedView.pageX;
      currentPage.panY = updatedView.pageY;
    }

    // 通知数据变更
    globalDataObserver.markChanged();

    lastMousePosition.current = { x: event.clientX, y: event.clientY };
  }

  /**
   * 处理节点悬停检测
   */
  private handleNodeHover(event: MouseEvent): void {
    const allNodes = nodeTree.getAllNodes();

    // 使用坐标系统管理器进行屏幕坐标转世界坐标
    const worldPoint = coordinateSystemManager.screenToWorld(
      event.clientX,
      event.clientY
    );
    const canvasX = worldPoint.x;
    const canvasY = worldPoint.y;

    // 检测鼠标是否在节点上
    for (const node of allNodes) {
      if (
        (!hoveredNode || hoveredNode.id !== node.id) &&
        this.isPointerInsideNode(node, canvasX, canvasY)
      ) {
        console.log("鼠标在节点上:", node.id);

        hoveredNode = node;
        if (typeof node.changeFills === "function") {
          node.changeFills();
        }
        break;
      }
    }

    console.log("画布位置", canvasX, canvasY);
  }

  /**
   * 判断鼠标是否在节点内
   */
  private isPointerInsideNode(node: BaseNode, x: number, y: number): boolean {
    return (
      x >= node.x && x <= node.x + node.w && y >= node.y && y <= node.y + node.h
    );
  }
}
