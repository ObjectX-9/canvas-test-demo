/**
 * 工具类型定义
 */
export type ToolType =
  | "select"
  | "rectangle"
  | "circle"
  | "text"
  | "pencil"
  | "eraser"
  | "hand"; // 手动工具，用于移动画布

/**
 * 工具模式定义
 */
export type ToolMode = "idle" | "drawing" | "creating" | "dragging" | "panning";

/**
 * 画笔工具配置
 */
export interface PencilConfig {
  strokeWidth: number;
  strokeColor: string;
  smoothness: number;
  lineCap: "round" | "square" | "butt";
  lineJoin: "round" | "bevel" | "miter";
}

/**
 * 工具状态管理器
 */
export class ToolStore {
  private currentTool: ToolType = "select";
  private currentMode: ToolMode = "idle";
  private pencilConfig: PencilConfig = {
    strokeWidth: 2,
    strokeColor: "#000000",
    smoothness: 0.5,
    lineCap: "round",
    lineJoin: "round",
  };

  private listeners: ((tool: ToolType, mode: ToolMode) => void)[] = [];

  /**
   * 获取当前工具
   */
  getCurrentTool(): ToolType {
    return this.currentTool;
  }

  /**
   * 获取当前模式
   */
  getCurrentMode(): ToolMode {
    return this.currentMode;
  }

  /**
   * 获取画笔配置
   */
  getPencilConfig(): PencilConfig {
    return { ...this.pencilConfig };
  }

  /**
   * 设置当前工具
   */
  setCurrentTool(tool: ToolType): void {
    if (this.currentTool !== tool) {
      this.currentTool = tool;
      // 切换工具时重置模式为空闲状态
      this.setCurrentMode("idle");
      this.notifyListeners();
    }
  }

  /**
   * 设置当前模式
   */
  setCurrentMode(mode: ToolMode): void {
    if (this.currentMode !== mode) {
      this.currentMode = mode;
      this.notifyListeners();
    }
  }

  /**
   * 更新画笔配置
   */
  updatePencilConfig(config: Partial<PencilConfig>): void {
    this.pencilConfig = { ...this.pencilConfig, ...config };
    this.notifyListeners();
  }

  /**
   * 检查是否为选择工具
   */
  isSelectTool(): boolean {
    return this.currentTool === "select";
  }

  /**
   * 检查是否为画笔工具
   */
  isPencilTool(): boolean {
    return this.currentTool === "pencil";
  }

  /**
   * 检查是否在绘制模式
   */
  isDrawing(): boolean {
    return this.currentMode === "drawing";
  }

  /**
   * 检查是否为手动工具
   */
  isHandTool(): boolean {
    return this.currentTool === "hand";
  }

  /**
   * 检查是否在平移模式
   */
  isPanning(): boolean {
    return this.currentMode === "panning";
  }

  /**
   * 检查是否在创建模式
   */
  isCreating(): boolean {
    return this.currentMode === "creating";
  }

  /**
   * 添加状态变化监听器
   */
  addListener(listener: (tool: ToolType, mode: ToolMode) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除状态变化监听器
   */
  removeListener(listener: (tool: ToolType, mode: ToolMode) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * 通知监听器状态变化
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentTool, this.currentMode);
      } catch (error) {
        console.error("ToolStore listener error:", error);
      }
    });
  }

  /**
   * 获取当前状态的描述
   */
  getStatusDescription(): string {
    const toolLabels = {
      select: "选择",
      rectangle: "矩形",
      circle: "圆形",
      text: "文本",
      pencil: "画笔",
      eraser: "橡皮擦",
      hand: "手动工具",
    };

    const modeLabels = {
      idle: "待机",
      drawing: "绘制中",
      creating: "创建中",
      dragging: "拖拽中",
      panning: "平移中",
    };

    return `${toolLabels[this.currentTool]}工具 - ${
      modeLabels[this.currentMode]
    }`;
  }

  /**
   * 重置为选择工具
   */
  resetToSelectTool(): void {
    this.setCurrentTool("select");
  }
}

// 全局工具状态管理器实例
export const toolStore = new ToolStore();
