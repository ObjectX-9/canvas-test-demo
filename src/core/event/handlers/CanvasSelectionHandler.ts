import {
  EventHandler,
  EventResult,
  EventContext,
  BaseEvent,
  MouseEvent,
  KeyboardEvent,
  InteractionState,
} from "../types";
import { selectionStore } from "../../store/SelectionStore";
import { HitTestUtils } from "../../utils/hitTest";
import { elementStore } from "../../store/ElementStore";
import { coordinateSystemManager } from "../../manage";

/**
 * 画布选择处理器
 * 类似Figma的选择交互：
 * - 单击选中节点
 * - Ctrl/Cmd + 单击多选
 * - 拖拽框选
 * - 点击空白处取消选择
 */
export class CanvasSelectionHandler implements EventHandler {
  name = "canvas-selection";
  readonly priority = 80; // 比拖拽和缩放低，比默认高

  // 选择框状态
  private isSelecting = false;
  private selectionStart: { x: number; y: number } | null = null;
  private selectionEnd: { x: number; y: number } | null = null;
  private isDragging = false;
  private dragThreshold = 3; // 拖拽阈值，避免误触

  canHandle(event: BaseEvent, _state: InteractionState): boolean {
    // 处理鼠标事件和键盘事件
    if (event.type.startsWith("mouse.")) {
      return true;
    }
    if (event.type === "key.down") {
      const keyEvent = event as KeyboardEvent;
      return keyEvent.key === "Escape" || keyEvent.key === "a";
    }
    return false;
  }

  async handle(event: BaseEvent, context: EventContext): Promise<EventResult> {
    if (event.type.startsWith("mouse.")) {
      return this.handleMouseEvent(event as MouseEvent, context);
    }
    if (event.type.startsWith("key.")) {
      return this.handleKeyboardEvent(event as KeyboardEvent, context);
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

  private handleKeyboardEvent(
    event: KeyboardEvent,
    _context: EventContext
  ): EventResult {
    switch (event.key) {
      case "Escape":
        // ESC键清除选择
        selectionStore.clearSelection();
        console.log("🔲 清除所有选择");
        return { handled: true, requestRender: true }; // 触发重新渲染以清除选中状态
      case "a":
        // Ctrl/Cmd + A 全选
        if (event.nativeEvent?.ctrlKey || event.nativeEvent?.metaKey) {
          this.selectAll();
          console.log("🔲 全选所有节点");
          return { handled: true, requestRender: true }; // 触发重新渲染以显示全选状态
        }
        break;
    }
    return { handled: false };
  }

  private handleMouseDown(
    event: MouseEvent,
    _context: EventContext
  ): EventResult {
    const nativeEvent = event.nativeEvent as globalThis.MouseEvent;
    const isMultiSelect = nativeEvent?.ctrlKey || nativeEvent?.metaKey;

    // 将屏幕坐标转换为世界坐标
    const worldPoint = coordinateSystemManager.screenToWorld(
      event.mousePoint.x,
      event.mousePoint.y
    );

    console.log(
      `🔲 鼠标按下: 屏幕(${event.mousePoint.x}, ${event.mousePoint.y}) → 世界(${worldPoint.x}, ${worldPoint.y})`
    );

    // 获取当前页面的所有节点
    const allNodes = this.getAllRenderableNodes();
    const hitNode = HitTestUtils.findNodeAtPoint(worldPoint, allNodes);

    if (hitNode) {
      // 点击到了节点
      console.log(`🎯 命中节点: ${hitNode.id} (${hitNode.type})`);

      if (isMultiSelect) {
        // 多选模式：切换节点选择状态
        selectionStore.toggleNode(hitNode.id);
        console.log(`🔲 切换选择: ${hitNode.id}`);
      } else {
        // 单选模式：只选择这个节点
        selectionStore.selectNode(hitNode.id);
        console.log(`🔲 单选: ${hitNode.id}`);
      }

      return { handled: true, requestRender: true }; // 触发重新渲染以显示选中状态
    } else {
      // 点击到了空白处
      console.log("🔲 点击空白处");

      if (!isMultiSelect) {
        // 非多选模式下，清除当前选择
        selectionStore.clearSelection();
        console.log("🔲 清除选择");
      }

      // 开始选择框操作
      this.startSelection(worldPoint);
      return { handled: true, requestRender: true }; // 触发重新渲染以清除之前的选中状态
    }
  }

  private handleMouseMove(
    event: MouseEvent,
    _context: EventContext
  ): EventResult {
    if (!this.isSelecting) {
      return { handled: false };
    }

    const worldPoint = coordinateSystemManager.screenToWorld(
      event.mousePoint.x,
      event.mousePoint.y
    );

    // 检查是否超过拖拽阈值
    if (!this.isDragging && this.selectionStart) {
      const dx = Math.abs(worldPoint.x - this.selectionStart.x);
      const dy = Math.abs(worldPoint.y - this.selectionStart.y);

      if (dx > this.dragThreshold || dy > this.dragThreshold) {
        this.isDragging = true;
        console.log("🔲 开始框选");
      }
    }

    if (this.isDragging) {
      this.updateSelection(worldPoint);
      // 触发重新渲染以显示选择框
      return { handled: true, requestRender: true };
    }

    return { handled: true };
  }

  private handleMouseUp(
    _event: MouseEvent,
    _context: EventContext
  ): EventResult {
    if (!this.isSelecting) {
      return { handled: false };
    }

    if (this.isDragging) {
      // 完成框选
      this.finishSelection();
      console.log("🔲 完成框选");
    }

    this.resetSelection();
    return { handled: true, requestRender: true }; // 清除选择框显示
  }

  private startSelection(worldPoint: { x: number; y: number }): void {
    this.isSelecting = true;
    this.selectionStart = { ...worldPoint };
    this.selectionEnd = { ...worldPoint };
    this.isDragging = false;
  }

  private updateSelection(worldPoint: { x: number; y: number }): void {
    this.selectionEnd = { ...worldPoint };
  }

  private finishSelection(): void {
    if (!this.selectionStart || !this.selectionEnd) return;

    // 计算选择框的边界
    const left = Math.min(this.selectionStart.x, this.selectionEnd.x);
    const right = Math.max(this.selectionStart.x, this.selectionEnd.x);
    const top = Math.min(this.selectionStart.y, this.selectionEnd.y);
    const bottom = Math.max(this.selectionStart.y, this.selectionEnd.y);

    console.log(`🔲 选择框范围: (${left}, ${top}) → (${right}, ${bottom})`);

    // 获取所有节点并检查哪些在选择框内
    const allNodes = this.getAllRenderableNodes();
    const selectedNodes = allNodes.filter((node) =>
      this.isNodeInSelectionBox(node, { left, right, top, bottom })
    );

    console.log(
      `🔲 框选到 ${selectedNodes.length} 个节点:`,
      selectedNodes.map((n) => n.id)
    );

    // 清除当前选择并添加新选择的节点
    selectionStore.clearSelection();
    selectedNodes.forEach((node) => {
      selectionStore.addToSelection(node.id);
    });
  }

  private resetSelection(): void {
    this.isSelecting = false;
    this.selectionStart = null;
    this.selectionEnd = null;
    this.isDragging = false;
  }

  private getAllRenderableNodes() {
    // 获取当前页面的所有节点
    const elements = elementStore.getElement();
    return Object.values(elements);
  }

  private isNodeInSelectionBox(
    node: { x: number; y: number; w: number; h: number },
    selectionBox: { left: number; right: number; top: number; bottom: number }
  ): boolean {
    const nodeLeft = node.x;
    const nodeRight = node.x + node.w;
    const nodeTop = node.y;
    const nodeBottom = node.y + node.h;

    // 检查节点是否与选择框有交集
    return !(
      nodeRight < selectionBox.left ||
      nodeLeft > selectionBox.right ||
      nodeBottom < selectionBox.top ||
      nodeTop > selectionBox.bottom
    );
  }

  private selectAll(): void {
    const allNodes = this.getAllRenderableNodes();
    selectionStore.clearSelection();
    allNodes.forEach((node) => {
      selectionStore.addToSelection(node.id);
    });
  }

  /**
   * 获取当前选择框的边界（用于渲染）
   */
  getSelectionBounds(): {
    start: { x: number; y: number };
    end: { x: number; y: number };
  } | null {
    if (!this.isDragging || !this.selectionStart || !this.selectionEnd) {
      return null;
    }
    return {
      start: this.selectionStart,
      end: this.selectionEnd,
    };
  }

  /**
   * 是否正在进行框选
   */
  isSelectionActive(): boolean {
    return this.isDragging;
  }
}
