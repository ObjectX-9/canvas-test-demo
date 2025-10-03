import {
  EventHandler,
  EventResult,
  EventContext,
  BaseEvent,
  MouseEvent,
  InteractionState,
} from "../types";
import { selectionStore } from "../../store/SelectionStore";
import { HitTestUtils } from "../../utils/hitTest";
import { nodeTree } from "../../nodeTree";
import { coordinateSystemManager } from "../../manage";
import { BaseNode } from "../../nodeTree/node/baseNode";

/**
 * 画布拖拽处理器
 * 处理选中节点的拖拽移动功能：
 * - 检测在选中节点上开始拖拽
 * - 支持单个和多个节点同时拖拽
 * - 实时更新节点位置
 * - 拖拽结束时提交更改
 */
export class CanvasDragHandler implements EventHandler {
  name = "canvas-drag";
  readonly priority = 90; // 比选择handler(80)高，确保在选中节点上优先处理拖拽

  // 拖拽状态
  private isDragging = false;
  private dragStartPoint: { x: number; y: number } | null = null;
  private dragCurrentPoint: { x: number; y: number } | null = null;
  private draggedNodes: Array<{
    id: string;
    originalX: number;
    originalY: number;
    currentX: number;
    currentY: number;
  }> = [];

  private dragThreshold = 3; // 拖拽阈值，避免误触

  canHandle(event: BaseEvent, _state: InteractionState): boolean {
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
      `🟡 拖拽检测: 屏幕(${event.mousePoint.x}, ${event.mousePoint.y}) → 世界(${worldPoint.x}, ${worldPoint.y})`
    );

    // 检查是否在选中的节点上按下
    const selectedIds = selectionStore.getSelectedNodeIds();
    if (selectedIds.length === 0) {
      // 没有选中的节点，不处理
      return { handled: false };
    }

    // 检查点击位置是否在任何选中的节点上
    const hitSelectedNode = this.checkHitSelectedNode(worldPoint, selectedIds);

    if (hitSelectedNode) {
      // 在选中节点上按下，准备拖拽
      console.log(`🟡 准备拖拽选中节点: ${hitSelectedNode.id}`);
      this.startDrag(worldPoint, selectedIds);
      return { handled: true }; // 阻止选择handler处理
    }

    // 不在选中节点上，让选择handler处理
    return { handled: false };
  }

  private handleMouseMove(
    event: MouseEvent,
    _context: EventContext
  ): EventResult {
    if (!this.dragStartPoint) {
      return { handled: false };
    }

    const worldPoint = coordinateSystemManager.screenToWorld(
      event.mousePoint.x,
      event.mousePoint.y
    );

    // 检查是否超过拖拽阈值
    if (!this.isDragging) {
      const dx = Math.abs(worldPoint.x - this.dragStartPoint.x);
      const dy = Math.abs(worldPoint.y - this.dragStartPoint.y);

      if (dx > this.dragThreshold || dy > this.dragThreshold) {
        this.isDragging = true;
        console.log("🟡 开始拖拽节点");
      } else {
        // 还没超过阈值，不处理
        return { handled: true };
      }
    }

    if (this.isDragging) {
      this.updateDrag(worldPoint);
      return { handled: true, requestRender: true };
    }

    return { handled: true };
  }

  private handleMouseUp(
    _event: MouseEvent,
    _context: EventContext
  ): EventResult {
    if (!this.dragStartPoint) {
      return { handled: false };
    }

    if (this.isDragging) {
      // 完成拖拽
      this.finishDrag();
      console.log("🟡 完成拖拽节点");
      return { handled: true, requestRender: true };
    } else {
      // 没有发生实际拖拽，重置状态
      this.resetDrag();
      // 让选择handler处理点击选择
      return { handled: false };
    }
  }

  private checkHitSelectedNode(
    worldPoint: { x: number; y: number },
    selectedIds: string[]
  ): { id: string } | null {
    for (const nodeId of selectedIds) {
      const node = nodeTree.getNodeById(nodeId);
      if (node) {
        const baseNode = node as BaseNode;
        if (HitTestUtils.isPointInNode(worldPoint, baseNode)) {
          return { id: nodeId };
        }
      }
    }
    return null;
  }

  private startDrag(
    worldPoint: { x: number; y: number },
    selectedIds: string[]
  ): void {
    this.dragStartPoint = { ...worldPoint };
    this.dragCurrentPoint = { ...worldPoint };
    this.isDragging = false;

    // 记录所有选中节点的原始位置
    this.draggedNodes = selectedIds.map((nodeId) => {
      const node = nodeTree.getNodeById(nodeId);
      const baseNode = node as BaseNode;
      if (!baseNode) {
        throw new Error(`找不到节点: ${nodeId}`);
      }

      return {
        id: nodeId,
        originalX: baseNode.x,
        originalY: baseNode.y,
        currentX: baseNode.x,
        currentY: baseNode.y,
      };
    });

    console.log(`🟡 初始化拖拽，节点数量: ${this.draggedNodes.length}`);
  }

  private updateDrag(worldPoint: { x: number; y: number }): void {
    if (!this.dragStartPoint || !this.dragCurrentPoint) return;

    // 计算拖拽偏移量
    const deltaX = worldPoint.x - this.dragStartPoint.x;
    const deltaY = worldPoint.y - this.dragStartPoint.y;

    console.log(`🟡 拖拽偏移: (${deltaX.toFixed(1)}, ${deltaY.toFixed(1)})`);

    // 更新所有拖拽节点的位置
    this.draggedNodes.forEach((draggedNode) => {
      const newX = draggedNode.originalX + deltaX;
      const newY = draggedNode.originalY + deltaY;

      draggedNode.currentX = newX;
      draggedNode.currentY = newY;

      // 更新节点状态
      const node = nodeTree.getNodeById(draggedNode.id);
      if (node) {
        const baseNode = node as BaseNode;
        baseNode.x = newX;
        baseNode.y = newY;
      }
    });

    this.dragCurrentPoint = { ...worldPoint };
  }

  private finishDrag(): void {
    if (this.draggedNodes.length > 0) {
      console.log(
        `🟡 完成拖拽 ${this.draggedNodes.length} 个节点，最终位置:`,
        this.draggedNodes.map((n) => ({
          id: n.id,
          from: `(${n.originalX}, ${n.originalY})`,
          to: `(${n.currentX}, ${n.currentY})`,
        }))
      );

      // 这里可以添加撤销/重做历史记录
      // 或者触发其他需要的事件
    }

    this.resetDrag();
  }

  private resetDrag(): void {
    this.isDragging = false;
    this.dragStartPoint = null;
    this.dragCurrentPoint = null;
    this.draggedNodes = [];
  }

  /**
   * 获取当前拖拽状态（用于调试或其他组件）
   */
  getDragInfo() {
    return {
      isDragging: this.isDragging,
      draggedNodesCount: this.draggedNodes.length,
      dragStartPoint: this.dragStartPoint,
      dragCurrentPoint: this.dragCurrentPoint,
    };
  }

  /**
   * 取消当前拖拽操作（恢复到原始位置）
   */
  cancelDrag(): void {
    if (this.isDragging && this.draggedNodes.length > 0) {
      console.log("🟡 取消拖拽，恢复节点原始位置");

      // 恢复所有节点到原始位置
      this.draggedNodes.forEach((draggedNode) => {
        const node = nodeTree.getNodeById(draggedNode.id);
        if (node) {
          const baseNode = node as BaseNode;
          baseNode.x = draggedNode.originalX;
          baseNode.y = draggedNode.originalY;
        }
      });
    }

    this.resetDrag();
  }
}
