import { EventContext } from "../manage/EventManager";
import { IMouseDownSubHandler } from "./mouseDown";
import { creationStore } from "../store/CreationStore";
import { nodeTree } from "../nodeTree";
import { RectangleState } from "../types/nodes/rectangleState";
// globalDataObserver已移除，数据变更由React状态系统处理
import { PageNode } from "../nodeTree/node/pageNode";

/**
 * 节点创建子处理器
 * 处理点击创建和拖拽创建节点的逻辑
 */
export class NodeCreationHandler implements IMouseDownSubHandler {
  readonly name = "node-creation";
  private isDragging = false;
  private dragStartPoint: { x: number; y: number } | null = null;
  private previewNodeId: string | null = null;

  canHandle(_event: MouseEvent, _context: EventContext): boolean {
    // 只在创建模式下处理
    return !creationStore.isSelectMode();
  }

  handle(event: MouseEvent, context: EventContext): boolean {
    const { coordinateSystemManager, currentPage } = context;

    if (!currentPage) {
      return false;
    }

    // 获取点击的世界坐标
    const rect = context.canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const worldPoint = coordinateSystemManager.screenToWorld(canvasX, canvasY);

    if (creationStore.isClickCreateMode()) {
      // 点击创建模式：直接在点击位置创建节点
      this.createNodeAtPoint(worldPoint.x, worldPoint.y, currentPage.id);
      return true;
    } else if (creationStore.isDragCreateMode()) {
      // 拖拽创建模式：开始拖拽，创建预览节点
      this.startDragCreation(
        worldPoint.x,
        worldPoint.y,
        currentPage.id,
        context
      );
      return true;
    }

    return false;
  }

  /**
   * 在指定位置创建节点（点击创建）
   */
  private createNodeAtPoint(x: number, y: number, pageId: string): void {
    const nodeType = creationStore.getSelectedNodeType();
    const defaultSize = this.getDefaultNodeSize(nodeType);

    const nodeState = this.createNodeState(
      x,
      y,
      defaultSize.width,
      defaultSize.height,
      nodeType
    );

    // 添加到节点树和页面
    nodeTree.addNode(nodeState);
    this.addNodeToPage(nodeState.id, pageId);
  }

  /**
   * 开始拖拽创建
   */
  private startDragCreation(
    x: number,
    y: number,
    pageId: string,
    context: EventContext
  ): void {
    this.isDragging = true;
    this.dragStartPoint = { x, y };

    const nodeType = creationStore.getSelectedNodeType();

    // 创建预览节点（初始大小很小）
    const previewNodeState = this.createNodeState(x, y, 1, 1, nodeType);
    this.previewNodeId = previewNodeState.id;

    // 添加到节点树（作为预览）
    nodeTree.addNode(previewNodeState);
    this.addNodeToPage(previewNodeState.id, pageId);
  }

  /**
   * 更新拖拽预览（在mousemove中调用）
   */
  updateDragPreview(event: MouseEvent, context: EventContext): void {
    if (!this.isDragging || !this.dragStartPoint || !this.previewNodeId) {
      return;
    }

    const { coordinateSystemManager } = context;
    const rect = context.canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const worldPoint = coordinateSystemManager.screenToWorld(canvasX, canvasY);

    // 计算拖拽区域
    const startX = Math.min(this.dragStartPoint.x, worldPoint.x);
    const startY = Math.min(this.dragStartPoint.y, worldPoint.y);
    const endX = Math.max(this.dragStartPoint.x, worldPoint.x);
    const endY = Math.max(this.dragStartPoint.y, worldPoint.y);

    const width = Math.max(endX - startX, 10); // 最小宽度10
    const height = Math.max(endY - startY, 10); // 最小高度10

    // 更新预览节点
    const previewNode = nodeTree.getNodeById(this.previewNodeId);
    if (previewNode) {
      previewNode.x = startX;
      previewNode.y = startY;
      previewNode.w = width;
      previewNode.h = height;
    }
  }

  /**
   * 完成拖拽创建（在mouseup中调用）
   */
  finishDragCreation(): void {
    if (!this.isDragging || !this.previewNodeId) {
      return;
    }

    const previewNode = nodeTree.getNodeById(this.previewNodeId);
    if (previewNode) {
      // 如果拖拽区域太小，使用默认大小
      if (previewNode.w < 20 || previewNode.h < 20) {
        const defaultSize = this.getDefaultNodeSize(
          creationStore.getSelectedNodeType()
        );
        previewNode.w = defaultSize.width;
        previewNode.h = defaultSize.height;
      }
    }

    // 重置拖拽状态
    this.isDragging = false;
    this.dragStartPoint = null;
    this.previewNodeId = null;
  }

  /**
   * 创建节点状态对象
   */
  private createNodeState(
    x: number,
    y: number,
    width: number,
    height: number,
    nodeType: string
  ): RectangleState {
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 目前只支持矩形，后续可以扩展其他类型
    return {
      id,
      type: "rectangle",
      x,
      y,
      w: width,
      h: height,
      fill: this.getDefaultNodeColor(nodeType),
      radius: nodeType === "circle" ? Math.min(width, height) / 2 : 0,
    } as RectangleState;
  }

  /**
   * 获取默认节点大小
   */
  private getDefaultNodeSize(nodeType: string): {
    width: number;
    height: number;
  } {
    switch (nodeType) {
      case "rectangle":
        return { width: 120, height: 80 };
      case "circle":
        return { width: 100, height: 100 };
      case "text":
        return { width: 80, height: 40 };
      default:
        return { width: 100, height: 60 };
    }
  }

  /**
   * 获取默认节点颜色
   */
  private getDefaultNodeColor(nodeType: string): string {
    switch (nodeType) {
      case "rectangle":
        return "#e3f2fd";
      case "circle":
        return "#f3e5f5";
      case "text":
        return "#fff3e0";
      default:
        return "#f5f5f5";
    }
  }

  /**
   * 将节点添加到页面
   */
  private addNodeToPage(nodeId: string, pageId: string): void {
    const page = nodeTree.getNodeById(pageId);
    if (page && page instanceof PageNode) {
      page.addChild(nodeId);
    }
  }

  /**
   * 检查是否正在拖拽创建
   */
  isDragCreating(): boolean {
    return this.isDragging;
  }

  /**
   * 获取当前预览节点ID
   */
  getPreviewNodeId(): string | null {
    return this.previewNodeId;
  }
}
