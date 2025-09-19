import { IEventHandler, EventContext } from "./EventManager";
import { HitTestUtils } from "../utils/hitTest";
import { elementStore } from "../store/ElementStore";

/**
 * 节点选择事件处理器
 * 处理鼠标点击选择节点的逻辑
 */
export class NodeSelectionHandler implements IEventHandler {
  readonly type = "mousedown";
  private isDraggingNode = false;
  private dragOffset = { x: 0, y: 0 };
  private selectedNodeId: string | null = null;

  canHandle(event: Event): boolean {
    return event.type === "mousedown";
  }

  handle(event: Event, context: EventContext): void {
    const mouseEvent = event as MouseEvent;
    const { canvas, currentPage, selectionStore, coordinateSystemManager } =
      context;

    if (!currentPage) return;

    // 获取鼠标在canvas中的位置
    const rect = canvas.getBoundingClientRect();
    const canvasX = mouseEvent.clientX - rect.left;
    const canvasY = mouseEvent.clientY - rect.top;

    // 转换为世界坐标
    const worldPoint = coordinateSystemManager.screenToWorld(canvasX, canvasY);

    // 获取页面中的所有节点
    const nodeIds = currentPage.children || [];
    const nodes = nodeIds
      .map((id) => elementStore.getOneElement(id))
      .filter((node): node is NonNullable<typeof node> => Boolean(node));

    // 查找被点击的节点
    const clickedNode = HitTestUtils.findNodeAtPoint(worldPoint, nodes);

    if (clickedNode) {
      // 点击了节点
      console.log("节点被点击:", clickedNode.id, clickedNode.type);
      const isMultiSelect = mouseEvent.ctrlKey || mouseEvent.metaKey;

      if (isMultiSelect) {
        // 多选模式：切换选择状态
        console.log("多选模式：切换节点", clickedNode.id);
        selectionStore.toggleNode(clickedNode.id);
      } else {
        // 单选模式：选中该节点
        console.log("单选模式：选中节点", clickedNode.id);
        selectionStore.selectNode(clickedNode.id);
      }

      // 准备拖拽
      this.isDraggingNode = true;
      this.selectedNodeId = clickedNode.id;
      this.dragOffset = {
        x: worldPoint.x - clickedNode.x,
        y: worldPoint.y - clickedNode.y,
      };

      // 阻止默认的视图拖拽，准备节点拖拽
      context.isDragging.current = false;
    } else {
      // 点击了空白区域
      console.log("点击了空白区域");
      if (!(mouseEvent.ctrlKey || mouseEvent.metaKey)) {
        // 非多选模式下清除选择
        console.log("清除所有选择");
        selectionStore.clearSelection();
      }

      // 启动视图拖拽
      this.isDraggingNode = false;
      this.selectedNodeId = null;
      context.isDragging.current = true;
      context.lastMousePosition.current = {
        x: mouseEvent.clientX,
        y: mouseEvent.clientY,
      };
    }
  }

  /**
   * 获取是否正在拖拽节点
   */
  isDragging(): boolean {
    return this.isDraggingNode;
  }

  /**
   * 获取拖拽偏移
   */
  getDragOffset(): { x: number; y: number } {
    return this.dragOffset;
  }

  /**
   * 获取当前拖拽的节点ID
   */
  getDraggingNodeId(): string | null {
    return this.selectedNodeId;
  }

  /**
   * 停止拖拽
   */
  stopDragging(): void {
    this.isDraggingNode = false;
    this.selectedNodeId = null;
  }
}
