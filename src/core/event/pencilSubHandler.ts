import { IMouseDownSubHandler } from "./mouseDown";
import { EventContext } from "../manage/EventManager";
import { toolStore } from "../store/ToolStore";
import { Pencil } from "../nodeTree/node/pencil";
import { PencilState } from "../types/nodes/pencilState";
import { nodeTree } from "../nodeTree";
import { coordinateSystemManager, pageManager } from "../manage";
import { globalDataObserver } from "../render";

/**
 * 画笔绘制状态
 */
interface PencilDrawState {
  isDrawing: boolean;
  currentPencil: Pencil | null;
  lastPoint: { x: number; y: number } | null;
}

/**
 * 画笔绘制子处理器
 */
export class PencilSubHandler implements IMouseDownSubHandler {
  readonly name = "PencilSubHandler";
  readonly priority = 100; // 高优先级

  private drawState: PencilDrawState = {
    isDrawing: false,
    currentPencil: null,
    lastPoint: null,
  };

  canHandle(event: MouseEvent, context: EventContext): boolean {
    return toolStore.isPencilTool();
  }

  handle(event: MouseEvent, context: EventContext): boolean {
    if (event.button !== 0) return false; // 只处理左键

    // 获取canvas相对坐标，然后转换为世界坐标
    const rect = context.canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const worldPoint = coordinateSystemManager.screenToWorld(canvasX, canvasY);

    // 开始绘制新的铅笔路径
    this.startDrawing(worldPoint);
    toolStore.setCurrentMode("drawing");

    // 注册鼠标移动和松开事件监听器
    this.attachMouseListeners(context);

    event.preventDefault();
    return true;
  }

  /**
   * 开始绘制
   */
  private startDrawing(startPoint: { x: number; y: number }): void {
    const config = toolStore.getPencilConfig();

    // 创建新的铅笔节点状态
    const pencilState: PencilState = {
      id: this.generatePencilId(),
      type: "pencil",
      name: "铅笔",
      x: startPoint.x,
      y: startPoint.y,
      w: 0,
      h: 0,
      rotation: 0,
      fill: "transparent", // 铅笔不需要填充
      points: [{ x: startPoint.x, y: startPoint.y }],
      strokeWidth: config.strokeWidth,
      strokeColor: config.strokeColor,
      lineCap: config.lineCap,
      lineJoin: config.lineJoin,
      finished: false,
      smoothness: config.smoothness,
    };

    // 创建铅笔节点
    const pencil = new Pencil(pencilState);

    // 设置绘制状态
    this.drawState = {
      isDrawing: true,
      currentPencil: pencil,
      lastPoint: startPoint,
    };

    // 添加到节点树
    nodeTree.addNode(pencilState);

    // 将节点添加到当前页面
    const currentPage = pageManager.getCurrentPage();
    if (currentPage) {
      currentPage.addChild(pencilState.id);
    }
  }

  /**
   * 附加鼠标事件监听器
   */
  private attachMouseListeners(context: EventContext): void {
    const handleMouseMove = (event: MouseEvent) => {
      this.handleMouseMove(event);
    };

    const handleMouseUp = (event: MouseEvent) => {
      this.handleMouseUp(event);
      // 移除事件监听器
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(event: MouseEvent): void {
    if (!this.drawState.isDrawing || !this.drawState.currentPencil) {
      return;
    }

    // 获取canvas相对坐标，然后转换为世界坐标
    const canvas = document.querySelector(
      "#canvasContainer"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;
    const worldPoint = coordinateSystemManager.screenToWorld(canvasX, canvasY);

    // 检查是否需要添加新点（避免过于密集的点）
    if (this.shouldAddPoint(worldPoint)) {
      // 计算压力（如果支持的话）
      const pressure = this.getPressure(event);

      // 添加路径点
      this.drawState.currentPencil.addPoint(
        worldPoint.x,
        worldPoint.y,
        pressure
      );
      this.drawState.lastPoint = worldPoint;
    }

    // 无论是否添加新点，都触发重新渲染以显示当前绘制状态
    globalDataObserver.markChanged();
  }

  /**
   * 处理鼠标松开事件
   */
  private handleMouseUp(event: MouseEvent): void {
    if (!this.drawState.isDrawing) return;

    this.finishDrawing();
    toolStore.setCurrentMode("idle");
  }

  /**
   * 完成绘制
   */
  private finishDrawing(): void {
    if (!this.drawState.currentPencil) return;

    // 标记绘制完成
    this.drawState.currentPencil.finished = true;

    // 如果路径太短，可以选择简化
    if (this.drawState.currentPencil.points.length > 3) {
      this.drawState.currentPencil.simplifyPath(1);
    }

    // 触发最终渲染
    globalDataObserver.markChanged();

    // 重置绘制状态
    this.drawState = {
      isDrawing: false,
      currentPencil: null,
      lastPoint: null,
    };
  }

  /**
   * 判断是否应该添加新的路径点
   */
  private shouldAddPoint(currentPoint: { x: number; y: number }): boolean {
    if (!this.drawState.lastPoint) return true;

    // 计算与上一个点的距离
    const dx = currentPoint.x - this.drawState.lastPoint.x;
    const dy = currentPoint.y - this.drawState.lastPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 设置最小距离阈值，避免过于密集的点
    const minDistance = 0.5; // 降低阈值，让绘制更加流畅
    return distance >= minDistance;
  }

  /**
   * 获取压力值（如果支持的话）
   */
  private getPressure(event: MouseEvent): number {
    // 检查是否支持压力感应
    const pointerEvent = event as MouseEvent & { pressure?: number };
    if (pointerEvent.pressure !== undefined) {
      return Math.max(0.1, Math.min(1.0, pointerEvent.pressure));
    }

    // 默认压力值
    return 0.5;
  }

  /**
   * 生成铅笔节点ID
   */
  private generatePencilId(): string {
    return `pencil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 取消当前绘制
   */
  public cancelDrawing(): void {
    if (this.drawState.isDrawing && this.drawState.currentPencil) {
      // 从节点树中移除未完成的铅笔
      nodeTree.removeNode(this.drawState.currentPencil.id);
    }

    this.drawState = {
      isDrawing: false,
      currentPencil: null,
      lastPoint: null,
    };

    toolStore.setCurrentMode("idle");
  }

  /**
   * 检查是否正在绘制
   */
  public isDrawing(): boolean {
    return this.drawState.isDrawing;
  }
}
