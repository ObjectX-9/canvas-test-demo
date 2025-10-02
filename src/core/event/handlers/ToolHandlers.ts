import {
  EventHandler,
  EventResult,
  EventContext,
  BaseEvent,
  MouseEvent,
  InteractionState,
} from "../types";
import { toolStore } from "../../store/ToolStore";

/**
 * 选择工具事件处理器
 * 处理选择、拖拽等操作
 */
export class SelectionHandler implements EventHandler {
  name = "selection";
  priority = 100;

  private dragStartPoint: { x: number; y: number } | null = null;
  private isDragging = false;
  private dragThreshold = 3; // 拖拽阈值

  canHandle(event: BaseEvent, state: InteractionState): boolean {
    return toolStore.getCurrentTool() === "select";
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
      default:
        return { handled: false };
    }
  }

  private handleMouseDown(
    event: MouseEvent,
    context: EventContext
  ): EventResult {
    this.dragStartPoint = { ...event.canvasPoint };
    this.isDragging = false;

    // 碰撞检测
    const hitResult = context.hitTest(event.canvasPoint);

    if (hitResult) {
      // 点击到了节点
      const isSelected = context.selection
        .getSelected()
        .includes(hitResult.nodeId);

      if (!event.shiftKey && !isSelected) {
        // 单选
        context.selection.select([hitResult.nodeId]);
      } else if (event.shiftKey) {
        // 多选
        const currentSelection = context.selection.getSelected();
        if (isSelected) {
          // 取消选择
          context.selection.select(
            currentSelection.filter((id) => id !== hitResult.nodeId)
          );
        } else {
          // 添加到选择
          context.selection.select([...currentSelection, hitResult.nodeId]);
        }
      }

      context.cursor.set("move");
      return {
        handled: true,
        newState: "selecting",
        requestRender: true,
      };
    } else {
      // 点击空白区域
      if (!event.shiftKey) {
        context.selection.clear();
      }

      return {
        handled: true,
        newState: "selecting",
        requestRender: true,
      };
    }
  }

  private handleMouseMove(
    event: MouseEvent,
    context: EventContext
  ): EventResult {
    if (!this.dragStartPoint) {
      // 悬停状态，检查光标样式
      const hitResult = context.hitTest(event.canvasPoint);
      context.cursor.set(hitResult ? "pointer" : "default");

      return {
        handled: true,
        requestRender: false,
      };
    }

    // 检查是否开始拖拽
    const distance = Math.sqrt(
      Math.pow(event.canvasPoint.x - this.dragStartPoint.x, 2) +
        Math.pow(event.canvasPoint.y - this.dragStartPoint.y, 2)
    );

    if (!this.isDragging && distance > this.dragThreshold) {
      this.isDragging = true;
    }

    if (this.isDragging) {
      // 拖拽中
      const selectedNodes = context.selection.getSelected();
      if (selectedNodes.length > 0) {
        const deltaX = event.canvasPoint.x - this.dragStartPoint.x;
        const deltaY = event.canvasPoint.y - this.dragStartPoint.y;

        // 更新选中节点的位置
        selectedNodes.forEach((nodeId) => {
          const node = context.nodes.get(nodeId);
          if (
            node &&
            typeof node.x === "number" &&
            typeof node.y === "number"
          ) {
            context.nodes.update(nodeId, {
              x: (node.x as number) + deltaX,
              y: (node.y as number) + deltaY,
            });
          }
        });

        this.dragStartPoint = { ...event.canvasPoint };

        return {
          handled: true,
          newState: "dragging",
          requestRender: true,
        };
      }
    }

    return { handled: true };
  }

  private handleMouseUp(event: MouseEvent, context: EventContext): EventResult {
    const wasDragging = this.isDragging;

    this.dragStartPoint = null;
    this.isDragging = false;
    context.cursor.reset();

    return {
      handled: true,
      newState: "idle",
      requestRender: wasDragging,
    };
  }
}

/**
 * 矩形创建工具处理器
 */
export class RectangleCreationHandler implements EventHandler {
  name = "rectangle-creation";
  priority = 90;

  private startPoint: { x: number; y: number } | null = null;
  private creatingNodeId: string | null = null;

  canHandle(event: BaseEvent, state: InteractionState): boolean {
    return toolStore.getCurrentTool() === "rectangle";
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
      default:
        return { handled: false };
    }
  }

  private handleMouseDown(
    event: MouseEvent,
    context: EventContext
  ): EventResult {
    this.startPoint = { ...event.canvasPoint };

    // 创建矩形节点
    this.creatingNodeId = context.nodes.create("rectangle", {
      x: event.canvasPoint.x,
      y: event.canvasPoint.y,
      width: 0,
      height: 0,
      fill: "#3b82f6",
      stroke: "#1d4ed8",
      strokeWidth: 2,
    });

    context.cursor.set("crosshair");

    return {
      handled: true,
      newState: "creating",
      requestRender: true,
    };
  }

  private handleMouseMove(
    event: MouseEvent,
    context: EventContext
  ): EventResult {
    if (!this.startPoint || !this.creatingNodeId) {
      return { handled: false };
    }

    const width = Math.abs(event.canvasPoint.x - this.startPoint.x);
    const height = Math.abs(event.canvasPoint.y - this.startPoint.y);
    const x = Math.min(event.canvasPoint.x, this.startPoint.x);
    const y = Math.min(event.canvasPoint.y, this.startPoint.y);

    // 更新矩形大小
    context.nodes.update(this.creatingNodeId, {
      x,
      y,
      width,
      height,
    });

    return {
      handled: true,
      newState: "creating",
      requestRender: true,
    };
  }

  private handleMouseUp(event: MouseEvent, context: EventContext): EventResult {
    if (this.creatingNodeId) {
      // 选中新创建的节点
      context.selection.select([this.creatingNodeId]);
    }

    this.startPoint = null;
    this.creatingNodeId = null;
    context.cursor.reset();

    // 创建完成后自动切换回选择工具
    toolStore.setCurrentTool("select");

    return {
      handled: true,
      newState: "idle",
      requestRender: true,
    };
  }
}

/**
 * 画笔工具处理器
 */
export class PencilHandler implements EventHandler {
  name = "pencil";
  priority = 85;

  private isDrawing = false;
  private currentStrokeId: string | null = null;
  private points: { x: number; y: number }[] = [];

  canHandle(event: BaseEvent, state: InteractionState): boolean {
    return toolStore.getCurrentTool() === "pencil";
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
      default:
        return { handled: false };
    }
  }

  private handleMouseDown(
    event: MouseEvent,
    context: EventContext
  ): EventResult {
    this.isDrawing = true;
    this.points = [{ ...event.canvasPoint }];

    const pencilConfig = toolStore.getPencilConfig();

    // 创建画笔描边
    this.currentStrokeId = context.nodes.create("pencil", {
      points: [...this.points],
      strokeWidth: pencilConfig.strokeWidth,
      strokeColor: pencilConfig.strokeColor,
      lineCap: pencilConfig.lineCap,
      lineJoin: pencilConfig.lineJoin,
    });

    context.cursor.set("crosshair");

    return {
      handled: true,
      newState: "drawing",
      requestRender: true,
    };
  }

  private handleMouseMove(
    event: MouseEvent,
    context: EventContext
  ): EventResult {
    if (!this.isDrawing || !this.currentStrokeId) {
      return { handled: false };
    }

    // 添加新点
    this.points.push({ ...event.canvasPoint });

    // 更新描边路径
    context.nodes.update(this.currentStrokeId, {
      points: [...this.points],
    });

    return {
      handled: true,
      newState: "drawing",
      requestRender: true,
    };
  }

  private handleMouseUp(event: MouseEvent, context: EventContext): EventResult {
    if (this.currentStrokeId) {
      // 选中新创建的描边
      context.selection.select([this.currentStrokeId]);
    }

    this.isDrawing = false;
    this.currentStrokeId = null;
    this.points = [];
    context.cursor.reset();

    return {
      handled: true,
      newState: "idle",
      requestRender: true,
    };
  }
}
