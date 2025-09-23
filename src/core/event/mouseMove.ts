import { IEventHandler, EventContext } from "../manage/EventManager";
import { coordinateSystemManager } from "../manage";
import { globalDataObserver } from "../render";
import { nodeTree } from "../nodeTree";
import { ViewMatrix, ViewUtils } from "../types";
import { BaseNode } from "../nodeTree/node/baseNode";
import { Page } from "../nodeTree/node/page";

// 悬停节点的全局状态（已移至类内部管理）

/**
 * 鼠标移动事件处理器
 */
export class MouseMoveHandler implements IEventHandler {
  private lastMousePosition = { x: 0, y: 0 };
  private currentHoverNode: BaseNode | null = null;

  readonly type = "canvas-panning";
  readonly nativeEventType = "mousemove";

  canHandle(event: Event): boolean {
    return event.type === this.nativeEventType;
  }

  handle(event: Event, context: EventContext): void {
    const mouseMoveEvent = event as MouseEvent;
    const { currentPage, setViewState, isDragging } = context;

    if (isDragging.current && currentPage) {
      // 执行画布拖拽（节点拖拽由NodeDragHandler处理）
      this.handlePanning(mouseMoveEvent, currentPage, setViewState);
    }

    // 处理节点悬停检测
    this.handleNodeHover(mouseMoveEvent);

    // 更新鼠标位置记录
    this.lastMousePosition = {
      x: mouseMoveEvent.clientX,
      y: mouseMoveEvent.clientY,
    };
  }

  /**
   * 处理画布拖拽平移
   */
  private handlePanning(
    event: MouseEvent,
    currentPage: Page,
    setViewState: (view: ViewMatrix) => void
  ): void {
    const deltaX = event.clientX - this.lastMousePosition.x;
    const deltaY = event.clientY - this.lastMousePosition.y;

    // 使用坐标系统管理器更新视图位置
    coordinateSystemManager.updateViewPosition(deltaX, deltaY);
    const updatedView = coordinateSystemManager.getViewState();
    setViewState(updatedView);

    // 同步视图状态到当前页面
    if (currentPage) {
      const translation = ViewUtils.getTranslation(updatedView);
      currentPage.panX = translation.pageX;
      currentPage.panY = translation.pageY;
    }

    // 通知数据变更
    globalDataObserver.markChanged();

    this.lastMousePosition = { x: event.clientX, y: event.clientY };
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
    const worldX = worldPoint.x;
    const worldY = worldPoint.y;

    // 检测悬停的节点
    for (const node of allNodes) {
      if (
        (!this.currentHoverNode || this.currentHoverNode.id !== node.id) &&
        this.isPointerInsideNode(node, worldX, worldY)
      ) {
        console.log("鼠标在节点上:", node.id);
        this.currentHoverNode = node;

        // 改变节点填充色（如果有相关方法）
        if (typeof node.changeFills === "function") {
          node.changeFills(); // 悬停效果
        }
        break;
      }
    }
  }

  /**
   * 检查点是否在节点内
   */
  private isPointerInsideNode(node: BaseNode, x: number, y: number): boolean {
    return (
      x >= node.x && x <= node.x + node.w && y >= node.y && y <= node.y + node.h
    );
  }
}
