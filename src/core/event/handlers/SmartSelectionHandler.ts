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
import { smartHitTest, SelectionMode } from "../../utils/SmartHitTest";
import { elementStore } from "../../store/ElementStore";
import { coordinateSystemManager } from "../../manage";
import { nodeTree } from "../../nodeTree";
import { BaseNode } from "../../nodeTree/node/baseNode";

/**
 * 选择反馈系统
 */
interface SelectionFeedback {
  selectedCount: number;
  totalCandidates: number;
  selectionTime: number;
  mode: "point" | "rectangle";
}

/**
 * Figma风格的智能画布选择处理器
 *
 * 🎯 核心特性:
 * - 智能选择优先级（小节点、文本、边缘优先）
 * - 空间分区性能优化
 * - 多种框选模式
 * - 智能交互反馈
 * - 性能监控和自适应
 */
export class SmartSelectionHandler implements EventHandler {
  name = "smart-canvas-selection";
  readonly priority = 80; // 与原选择handler相同

  // 选择框状态
  private isSelecting = false;
  private selectionStart: { x: number; y: number } | null = null;
  private selectionEnd: { x: number; y: number } | null = null;
  private isDragging = false;
  private readonly dragThreshold = 3;

  // 智能选择配置
  private selectionMode: SelectionMode = SelectionMode.INTERSECTS;
  private enableSmartPriority = true;
  private performanceMode = false;
  private lastSelectionTime = 0;

  // 性能监控
  private performanceStats = {
    averageSelectionTime: 0,
    peakSelectionTime: 0,
    selectionCount: 0,
    performanceModeActivations: 0,
  };

  canHandle(event: BaseEvent, _state: InteractionState): boolean {
    // 处理鼠标事件和键盘事件
    if (event.type.startsWith("mouse.")) {
      return true;
    }
    if (event.type === "key.down") {
      const keyEvent = event as KeyboardEvent;
      return (
        keyEvent.key === "Escape" ||
        keyEvent.key === "a" ||
        keyEvent.key === "Tab"
      );
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
        return this.handleEscape();
      case "a":
        if (event.nativeEvent?.ctrlKey || event.nativeEvent?.metaKey) {
          return this.handleSelectAll();
        }
        break;
      case "Tab":
        return this.handleTabSelection(event.nativeEvent?.shiftKey || false);
    }
    return { handled: false };
  }

  private handleMouseDown(
    event: MouseEvent,
    _context: EventContext
  ): EventResult {
    const startTime = performance.now();
    const nativeEvent = event.nativeEvent as globalThis.MouseEvent;
    const isMultiSelect = nativeEvent?.ctrlKey || nativeEvent?.metaKey;

    // 坐标转换
    const worldPoint = coordinateSystemManager.screenToWorld(
      event.mousePoint.x,
      event.mousePoint.y
    );

    console.log(
      `🧠 智能选择开始: 屏幕(${event.mousePoint.x}, ${event.mousePoint.y}) → 世界(${worldPoint.x}, ${worldPoint.y})`
    );

    // 获取所有可渲染节点
    const allNodes = this.getAllRenderableNodes();

    // 🎯 核心：使用智能碰撞检测（传递canvas以启用视口优化）
    const hitNode = this.enableSmartPriority
      ? smartHitTest.findBestNodeAtPoint(worldPoint, allNodes, _context.canvas)
      : this.fallbackHitTest(worldPoint, allNodes);

    const selectionTime = performance.now() - startTime;
    this.updatePerformanceStats(selectionTime);

    if (hitNode) {
      // 节点选择逻辑
      this.handleNodeSelection(hitNode, isMultiSelect);

      const feedback: SelectionFeedback = {
        selectedCount: 1,
        totalCandidates: allNodes.length,
        selectionTime,
        mode: "point",
      };

      this.logSelectionFeedback(feedback);
      return { handled: true, requestRender: true };
    } else {
      // 空白区域 - 准备框选
      if (!isMultiSelect) {
        selectionStore.clearSelection();
        console.log("🧠 清除选择");
      }

      this.startSelection(worldPoint);
      return { handled: true, requestRender: true };
    }
  }

  private handleMouseMove(
    event: MouseEvent,
    _context: EventContext
  ): EventResult {
    if (!this.isSelecting || !this.selectionStart) {
      return { handled: false };
    }

    const worldPoint = coordinateSystemManager.screenToWorld(
      event.mousePoint.x,
      event.mousePoint.y
    );

    // 检查拖拽阈值
    if (!this.isDragging) {
      const dx = Math.abs(worldPoint.x - this.selectionStart.x);
      const dy = Math.abs(worldPoint.y - this.selectionStart.y);

      if (dx > this.dragThreshold || dy > this.dragThreshold) {
        this.isDragging = true;
        console.log("🧠 开始智能框选");
      } else {
        return { handled: true };
      }
    }

    if (this.isDragging) {
      this.updateSelection(worldPoint);
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
      const startTime = performance.now();
      this.finishSelection();
      const selectionTime = performance.now() - startTime;

      console.log("🧠 完成智能框选");
      this.updatePerformanceStats(selectionTime);
    }

    this.resetSelection();
    return { handled: true, requestRender: true };
  }

  private handleEscape(): EventResult {
    selectionStore.clearSelection();
    this.resetSelection();
    console.log("🧠 ESC清除选择");
    return { handled: true, requestRender: true };
  }

  private handleSelectAll(): EventResult {
    const allNodes = this.getAllRenderableNodes();
    selectionStore.clearSelection();
    allNodes.forEach((node) => {
      selectionStore.addToSelection(node.id);
    });

    console.log(`🧠 全选: ${allNodes.length} 个节点`);
    return { handled: true, requestRender: true };
  }

  private handleTabSelection(isReverse: boolean): EventResult {
    const allNodes = this.getAllRenderableNodes();
    const selectedIds = selectionStore.getSelectedNodeIds();

    if (allNodes.length === 0) {
      return { handled: false };
    }

    let newIndex = 0;

    if (selectedIds.length > 0) {
      const currentNode = allNodes.find((node) => node.id === selectedIds[0]);
      if (currentNode) {
        const currentIndex = allNodes.indexOf(currentNode);
        newIndex = isReverse
          ? (currentIndex - 1 + allNodes.length) % allNodes.length
          : (currentIndex + 1) % allNodes.length;
      }
    }

    const targetNode = allNodes[newIndex];
    selectionStore.selectNode(targetNode.id);

    console.log(
      `🧠 Tab选择: ${targetNode.id} (${isReverse ? "反向" : "正向"})`
    );
    return { handled: true, requestRender: true };
  }

  private handleNodeSelection(node: BaseNode, isMultiSelect: boolean): void {
    if (isMultiSelect) {
      selectionStore.toggleNode(node.id);
      console.log(`🧠 智能切换选择: ${node.id}`);
    } else {
      selectionStore.selectNode(node.id);
      console.log(`🧠 智能单选: ${node.id}`);
    }
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

    const left = Math.min(this.selectionStart.x, this.selectionEnd.x);
    const right = Math.max(this.selectionStart.x, this.selectionEnd.x);
    const top = Math.min(this.selectionStart.y, this.selectionEnd.y);
    const bottom = Math.max(this.selectionStart.y, this.selectionEnd.y);

    const selectionRect = {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };

    console.log(
      `🧠 框选区域: (${left.toFixed(1)}, ${top.toFixed(1)}) → (${right.toFixed(
        1
      )}, ${bottom.toFixed(1)})`
    );

    // 🎯 核心：使用智能框选检测（传递canvas以启用视口优化）
    const allNodes = this.getAllRenderableNodes();
    const selectedNodes = smartHitTest.findNodesInRectangle(
      selectionRect,
      allNodes,
      this.selectionMode,
      document.querySelector("canvas") as HTMLCanvasElement // 获取canvas元素
    );

    const feedback: SelectionFeedback = {
      selectedCount: selectedNodes.length,
      totalCandidates: allNodes.length,
      selectionTime: this.lastSelectionTime,
      mode: "rectangle",
    };

    // 应用选择
    selectionStore.clearSelection();
    selectedNodes.forEach((node) => {
      selectionStore.addToSelection(node.id);
    });

    this.logSelectionFeedback(feedback);
  }

  private resetSelection(): void {
    this.isSelecting = false;
    this.selectionStart = null;
    this.selectionEnd = null;
    this.isDragging = false;
  }

  private getAllRenderableNodes(): BaseNode[] {
    const elements = elementStore.getElement();
    return Object.keys(elements).map((nodeId) => {
      const node = nodeTree.getNodeById(nodeId);
      if (!node) {
        throw new Error(`找不到节点: ${nodeId}`);
      }
      return node as BaseNode;
    });
  }

  private fallbackHitTest(
    point: { x: number; y: number },
    nodes: BaseNode[]
  ): BaseNode | null {
    // 简单的回退碰撞检测
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (
        point.x >= node.x &&
        point.x <= node.x + node.w &&
        point.y >= node.y &&
        point.y <= node.y + node.h
      ) {
        return node;
      }
    }
    return null;
  }

  private updatePerformanceStats(selectionTime: number): void {
    this.performanceStats.selectionCount++;
    this.performanceStats.averageSelectionTime =
      (this.performanceStats.averageSelectionTime *
        (this.performanceStats.selectionCount - 1) +
        selectionTime) /
      this.performanceStats.selectionCount;

    if (selectionTime > this.performanceStats.peakSelectionTime) {
      this.performanceStats.peakSelectionTime = selectionTime;
    }

    this.lastSelectionTime = selectionTime;

    // 自适应性能优化
    if (selectionTime > 16 && !this.performanceMode) {
      // 超过一帧时间
      this.enablePerformanceMode();
    } else if (selectionTime < 8 && this.performanceMode) {
      this.disablePerformanceMode();
    }
  }

  private enablePerformanceMode(): void {
    this.performanceMode = true;
    smartHitTest.setPerformanceMode(true);
    this.performanceStats.performanceModeActivations++;
    console.log("⚡ 自动启用性能模式");
  }

  private disablePerformanceMode(): void {
    this.performanceMode = false;
    smartHitTest.setPerformanceMode(false);
    console.log("⚡ 关闭性能模式");
  }

  private logSelectionFeedback(feedback: SelectionFeedback): void {
    const efficiency =
      feedback.totalCandidates > 0
        ? ((feedback.selectedCount / feedback.totalCandidates) * 100).toFixed(1)
        : 0;

    console.log(
      `📊 选择反馈: ${feedback.selectedCount}/${feedback.totalCandidates} 节点 ` +
        `(${efficiency}% 效率) 耗时: ${feedback.selectionTime.toFixed(2)}ms ` +
        `模式: ${feedback.mode}`
    );
  }

  /**
   * 获取当前选择框边界（用于渲染）
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

  /**
   * 设置选择模式
   */
  setSelectionMode(mode: SelectionMode): void {
    this.selectionMode = mode;
    console.log(`🎯 选择模式切换: ${mode}`);
  }

  /**
   * 切换智能优先级
   */
  toggleSmartPriority(): void {
    this.enableSmartPriority = !this.enableSmartPriority;
    console.log(`🧠 智能优先级: ${this.enableSmartPriority ? "开启" : "关闭"}`);
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    return { ...this.performanceStats };
  }

  /**
   * 重置性能统计
   */
  resetPerformanceStats(): void {
    this.performanceStats = {
      averageSelectionTime: 0,
      peakSelectionTime: 0,
      selectionCount: 0,
      performanceModeActivations: 0,
    };
    console.log("📊 性能统计已重置");
  }
}
