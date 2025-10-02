import {
  EventHandler,
  EventResult,
  EventContext,
  BaseEvent,
  MouseEvent,
  KeyboardEvent,
  InteractionState,
} from "../types";
import { toolStore } from "../../store/ToolStore";
import { coordinateSystemManager } from "../../manage/CoordinateSystemManager";

/**
 * 画布移动处理器
 * 处理手动工具的画布拖拽移动功能
 */
export class CanvasPanHandler implements EventHandler {
  name = "canvas-pan";
  priority = 110; // 比选择工具优先级高

  private isPanning = false;
  private lastPanPoint: { x: number; y: number } | null = null;

  // 临时平移模式（按住空格键时启用）
  private isTemporaryPanMode = false;

  canHandle(event: BaseEvent, state: InteractionState): boolean {
    if (toolStore.getCurrentTool() !== "hand") {
      return false;
    }
    return true;
  }

  async handle(event: BaseEvent, context: EventContext): Promise<EventResult> {
    const mouseEvent = event as MouseEvent;

    switch (event.type) {
      case "mouse.down":
        return this.handleMouseDown(mouseEvent, context);
      case "mouse.move":
        return this.handleMouseMove(mouseEvent, context);
      case "mouse.up":
        return this.handleMouseUp(mouseEvent, context);
      case "key.down":
        return this.handleKeyDown(event, context);
      case "key.up":
        return this.handleKeyUp(event, context);
      default:
        return { handled: false };
    }
  }

  private handleMouseDown(
    event: MouseEvent,
    context: EventContext
  ): EventResult {
    this.isPanning = true;
    this.lastPanPoint = { ...event.mousePoint };

    return {
      handled: true,
      newState: "panning",
      requestRender: false,
    };
  }

  private handleMouseMove(
    event: MouseEvent,
    context: EventContext
  ): EventResult {
    if (!this.isPanning || !this.lastPanPoint) {
      return {
        handled: true,
        requestRender: false,
        newState: "idle", // 明确设置为idle状态
      };
    }

    // 计算移动距离
    const deltaX = event.mousePoint.x - this.lastPanPoint.x;
    const deltaY = event.mousePoint.y - this.lastPanPoint.y;

    // 应用平移偏移量到坐标系统
    coordinateSystemManager.updateViewPosition(deltaX, deltaY);

    // 更新最后的平移点
    this.lastPanPoint = { ...event.mousePoint };

    return {
      handled: true,
      newState: "panning",
      requestRender: true,
    };
  }

  private handleMouseUp(event: MouseEvent, context: EventContext): EventResult {
    this.isPanning = false;
    this.lastPanPoint = null;
    return {
      handled: true,
      newState: "idle",
      requestRender: false,
    };
  }

  private handleKeyDown(event: BaseEvent, context: EventContext): EventResult {
    const keyEvent = event as unknown as KeyboardEvent;

    // 空格键启用临时平移模式
    if (keyEvent.key === " " || keyEvent.code === "Space") {
      if (!this.isTemporaryPanMode && toolStore.getCurrentTool() !== "hand") {
        this.isTemporaryPanMode = true;
        keyEvent.preventDefault();

        return {
          handled: true,
          requestRender: false,
        };
      }
    }

    return { handled: false };
  }

  private handleKeyUp(event: BaseEvent, context: EventContext): EventResult {
    const keyEvent = event as unknown as KeyboardEvent;

    console.log(
      "⌨️ CanvasPanHandler - 处理按键释放:",
      keyEvent.key,
      keyEvent.code
    );

    // 释放空格键，退出临时平移模式
    if (keyEvent.key === " " || keyEvent.code === "Space") {
      if (this.isTemporaryPanMode) {
        this.isTemporaryPanMode = false;
        this.isPanning = false;
        this.lastPanPoint = null;

        return {
          handled: true,
          requestRender: false,
        };
      }
    }

    return { handled: false };
  }
}
