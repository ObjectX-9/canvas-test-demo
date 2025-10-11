import {
  EventHandler,
  EventResult,
  EventContext,
  BaseEvent,
  MouseEvent,
  InteractionState,
} from "../types";
import { toolStore } from "../../store/ToolStore";
import { coordinateSystemManager } from "../../manage/CoordinateSystemManager";
import { nodeTree } from "../../nodeTree";
import { RectangleState } from "../../types/nodes/rectangleState";
import { selectionStore } from "../../store/SelectionStore";

/**
 * 画布矩形创建处理器
 * 处理矩形工具的点击和拖拽创建功能：
 * - 点击创建默认大小矩形
 * - 拖拽创建自定义大小矩形
 * - 支持实时预览
 */
export class CanvasRectCreateHandler implements EventHandler {
  name = "canvas-rect-create";
  priority = 95; // 比拖拽handler(90)高，比选择handler(80)高，确保在矩形工具下优先处理

  // 创建状态
  private isCreating = false;
  private createStartPoint: { x: number; y: number } | null = null;
  private createCurrentPoint: { x: number; y: number } | null = null;
  private previewRectId: string | null = null;
  private isDragging = false;

  private dragThreshold = 3; // 拖拽阈值，避免误触
  private defaultRectSize = { width: 100, height: 60 }; // 默认矩形大小

  canHandle(event: BaseEvent, _state: InteractionState): boolean {
    // 只在矩形工具时处理
    if (toolStore.getCurrentTool() !== "rectangle") {
      return false;
    }

    // 只处理鼠标事件
    return event.type.startsWith("mouse.");
  }

  async handle(event: BaseEvent, context: EventContext): Promise<EventResult> {
    if (event.type.startsWith("mouse.")) {
      return this.handleMouseEvent(event as MouseEvent, context);
    }
    return { handled: false };
  }

  private handleMouseEvent(
    event: MouseEvent,
    context: EventContext
  ): EventResult {
    switch (event.type) {
      case "mouse.down":
        return this.handleMouseDown(event, context);
      case "mouse.move":
        return this.handleMouseMove(event, context);
      case "mouse.up":
        return this.handleMouseUp(event, context);
      default:
        return { handled: false };
    }
  }

  private handleMouseDown(
    event: MouseEvent,
    _context: EventContext
  ): EventResult {
    // 将屏幕坐标转换为世界坐标
    const worldPoint = coordinateSystemManager.screenToWorld(
      event.mousePoint.x,
      event.mousePoint.y
    );

    console.log(
      `🟢 矩形创建开始: 屏幕(${event.mousePoint.x}, ${event.mousePoint.y}) → 世界(${worldPoint.x}, ${worldPoint.y})`
    );

    // 开始创建矩形（但不立即创建预览，避免闪烁）
    this.startRectCreation(worldPoint);

    return {
      handled: true,
      newState: "creating",
      requestRender: false, // 还没创建预览矩形，不需要渲染
    };
  }

  private handleMouseMove(
    event: MouseEvent,
    _context: EventContext
  ): EventResult {
    if (!this.isCreating || !this.createStartPoint) {
      return { handled: false };
    }

    const worldPoint = coordinateSystemManager.screenToWorld(
      event.mousePoint.x,
      event.mousePoint.y
    );

    // 检查是否超过拖拽阈值
    if (!this.isDragging) {
      const dx = Math.abs(worldPoint.x - this.createStartPoint.x);
      const dy = Math.abs(worldPoint.y - this.createStartPoint.y);

      if (dx > this.dragThreshold || dy > this.dragThreshold) {
        this.isDragging = true;
        console.log("🟢 开始拖拽创建矩形");

        // 🔥 关键修复：只有在确定拖拽时才创建预览矩形，避免闪烁
        if (!this.previewRectId) {
          this.createPreviewRect(this.createStartPoint, worldPoint);
        }
      } else {
        // 还没超过阈值，不更新预览
        return { handled: true };
      }
    }

    if (this.isDragging) {
      this.updatePreviewRect(worldPoint);
      return { handled: true, requestRender: true };
    }

    return { handled: true };
  }

  private handleMouseUp(
    _event: MouseEvent,
    _context: EventContext
  ): EventResult {
    if (!this.isCreating) {
      return { handled: false };
    }

    if (this.isDragging) {
      // 完成拖拽创建
      this.finishRectCreation(true);
      console.log("🟢 完成拖拽创建矩形");
    } else {
      // 单击创建默认大小矩形（此时才创建预览矩形）
      if (!this.previewRectId) {
        this.createPreviewRect(this.createStartPoint!);
      }
      this.finishRectCreation(false);
      console.log("🟢 完成点击创建矩形");
    }

    this.resetCreation();
    return {
      handled: true,
      newState: "idle",
      requestRender: true,
    };
  }

  private startRectCreation(worldPoint: { x: number; y: number }): void {
    this.isCreating = true;
    this.createStartPoint = { ...worldPoint };
    this.createCurrentPoint = { ...worldPoint };
    this.isDragging = false;
  }

  private createPreviewRect(
    startPoint: { x: number; y: number },
    endPoint?: { x: number; y: number }
  ): void {
    // 生成唯一ID
    const rectId = `rect_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    this.previewRectId = rectId;

    let x: number, y: number, width: number, height: number;

    if (endPoint) {
      // 拖拽模式：根据起点和终点计算矩形
      x = Math.min(startPoint.x, endPoint.x);
      y = Math.min(startPoint.y, endPoint.y);
      width = Math.abs(endPoint.x - startPoint.x);
      height = Math.abs(endPoint.y - startPoint.y);

      // 确保最小尺寸
      const minSize = 10;
      width = Math.max(width, minSize);
      height = Math.max(height, minSize);
    } else {
      // 点击模式：使用默认大小
      x = startPoint.x;
      y = startPoint.y;
      width = this.defaultRectSize.width;
      height = this.defaultRectSize.height;
    }

    // 创建矩形状态
    const rectState: RectangleState = {
      id: rectId,
      type: "rectangle",
      name: "矩形",
      x,
      y,
      w: width,
      h: height,
      fill: "#ffaa00", // 橙色填充
      rotation: 0,
      radius: 4, // 圆角半径
    };

    // 添加到节点树（会自动添加到当前页面）
    nodeTree.addNode(rectState);

    console.log(
      `🟢 创建预览矩形: ${rectId} at (${x}, ${y}) 大小: ${width}x${height}`
    );
  }

  private updatePreviewRect(worldPoint: { x: number; y: number }): void {
    if (!this.previewRectId || !this.createStartPoint) return;

    const node = nodeTree.getNodeById(this.previewRectId);
    if (!node) return;

    // 计算矩形的位置和大小
    const left = Math.min(this.createStartPoint.x, worldPoint.x);
    const top = Math.min(this.createStartPoint.y, worldPoint.y);
    const width = Math.abs(worldPoint.x - this.createStartPoint.x);
    const height = Math.abs(worldPoint.y - this.createStartPoint.y);

    // 确保最小尺寸
    const minSize = 10;
    const finalWidth = Math.max(width, minSize);
    const finalHeight = Math.max(height, minSize);

    // 更新节点状态
    node.x = left;
    node.y = top;
    node.w = finalWidth;
    node.h = finalHeight;

    this.createCurrentPoint = { ...worldPoint };

    console.log(
      `🟢 更新矩形预览: (${left}, ${top}) 尺寸: ${finalWidth}x${finalHeight}`
    );
  }

  private finishRectCreation(isDragCreate: boolean): void {
    if (!this.previewRectId) return;

    const node = nodeTree.getNodeById(this.previewRectId);
    if (!node) return;

    if (!isDragCreate) {
      // 点击创建，使用默认大小
      node.w = this.defaultRectSize.width;
      node.h = this.defaultRectSize.height;

      console.log(
        `🟢 点击创建矩形完成: ${this.previewRectId} 大小: ${this.defaultRectSize.width}x${this.defaultRectSize.height}`
      );
    } else {
      console.log(
        `🟢 拖拽创建矩形完成: ${this.previewRectId} 大小: ${node.w}x${node.h}`
      );
    }

    // 选中新创建的矩形
    selectionStore.selectNode(this.previewRectId);

    // 矩形创建完成后，可以选择是否切换回选择工具
    // toolStore.setCurrentTool("select");
  }

  private resetCreation(): void {
    this.isCreating = false;
    this.createStartPoint = null;
    this.createCurrentPoint = null;
    this.previewRectId = null;
    this.isDragging = false;
  }

  /**
   * 取消当前矩形创建（删除预览矩形）
   */
  cancelCreation(): void {
    if (this.isCreating && this.previewRectId) {
      console.log("🟢 取消矩形创建");

      // 删除预览矩形（会自动从当前页面移除）
      nodeTree.removeNode(this.previewRectId);
    }

    this.resetCreation();
  }

  /**
   * 获取当前创建状态（用于调试或其他组件）
   */
  getCreationInfo() {
    return {
      isCreating: this.isCreating,
      isDragging: this.isDragging,
      previewRectId: this.previewRectId,
      createStartPoint: this.createStartPoint,
      createCurrentPoint: this.createCurrentPoint,
    };
  }

  /**
   * 设置默认矩形大小
   */
  setDefaultSize(width: number, height: number): void {
    this.defaultRectSize = { width, height };
  }
}
