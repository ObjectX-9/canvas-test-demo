import { EventContext } from "../manage/EventManager";
import { IMouseDownSubHandler } from "./mouseDown";
import { HitTestUtils } from "../utils/hitTest";
import { nodeTree } from "../nodeTree";

/**
 * 节点选择子处理器
 * 处理鼠标点击选择节点的逻辑
 */
export class NodeSelectionHandler implements IMouseDownSubHandler {
  readonly name = "node-selection";
  private isDraggingNode = false;
  private dragOffset = { x: 0, y: 0 };
  private selectedNodeId: string | null = null;

  canHandle(_event: MouseEvent, _context: EventContext): boolean {
    // 总是可以处理，在handle方法中判断具体逻辑
    return true;
  }

  handle(event: MouseEvent, context: EventContext): boolean {
    const mouseEvent = event;
    const { canvas, currentPage, selectionStore, coordinateSystemManager } =
      context;

    if (!currentPage) return false;

    // 获取鼠标在canvas中的位置
    const rect = canvas.getBoundingClientRect();
    const canvasX = mouseEvent.clientX - rect.left;
    const canvasY = mouseEvent.clientY - rect.top;

    // 转换为世界坐标
    const worldPoint = coordinateSystemManager.screenToWorld(canvasX, canvasY);

    // 获取页面中的所有节点
    const nodeIds = currentPage.children || [];
    const nodes = nodeIds
      .map((id) => nodeTree.getNodeById(id))
      .filter((node): node is NonNullable<typeof node> => Boolean(node));

    // 查找被点击的节点
    const clickedNode = HitTestUtils.findNodeAtPoint(worldPoint, nodes);

    if (clickedNode) {
      // 点击了节点
      const isMultiSelect = mouseEvent.ctrlKey || mouseEvent.metaKey;

      if (isMultiSelect) {
        // 多选模式：切换选择状态
        selectionStore.toggleNode(clickedNode.id);
      } else {
        // 单选模式：选中该节点
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

      // 返回true表示事件已处理，阻止后续处理器和默认行为
      return true;
    } else {
      // 点击了空白区域
      if (!(mouseEvent.ctrlKey || mouseEvent.metaKey)) {
        // 非多选模式下清除选择
        selectionStore.clearSelection();
      }

      // 重置节点拖拽状态
      this.isDraggingNode = false;
      this.selectedNodeId = null;

      // 返回false表示让默认行为处理（启动画布拖拽）
      return false;
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
