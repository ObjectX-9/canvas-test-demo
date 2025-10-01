import {
  NodeType,
  CreationMode,
} from "../../components/CanvasPanel/LeftPanel/Toolbar";

/**
 * 创建模式状态管理器
 * 负责管理当前的创建模式和选中的节点类型
 */
export class CreationStore {
  private creationMode: CreationMode = "select";
  private selectedNodeType: NodeType = "rectangle";
  private listeners: ((mode: CreationMode, nodeType: NodeType) => void)[] = [];

  /**
   * 获取当前创建模式
   */
  getCreationMode(): CreationMode {
    return this.creationMode;
  }

  /**
   * 获取当前选中的节点类型
   */
  getSelectedNodeType(): NodeType {
    return this.selectedNodeType;
  }

  /**
   * 设置创建模式
   */
  setCreationMode(mode: CreationMode): void {
    if (this.creationMode !== mode) {
      this.creationMode = mode;
      this.notifyListeners();
    }
  }

  /**
   * 设置选中的节点类型
   */
  setSelectedNodeType(nodeType: NodeType): void {
    if (this.selectedNodeType !== nodeType) {
      this.selectedNodeType = nodeType;
      this.notifyListeners();
    }
  }

  /**
   * 检查是否在选择模式
   */
  isSelectMode(): boolean {
    return this.creationMode === "select";
  }

  /**
   * 检查是否在点击创建模式
   */
  isClickCreateMode(): boolean {
    return this.creationMode === "click";
  }

  /**
   * 检查是否在拖拽创建模式
   */
  isDragCreateMode(): boolean {
    return this.creationMode === "drag";
  }

  /**
   * 添加状态变化监听器
   */
  addListener(
    listener: (mode: CreationMode, nodeType: NodeType) => void
  ): void {
    this.listeners.push(listener);
  }

  /**
   * 移除状态变化监听器
   */
  removeListener(
    listener: (mode: CreationMode, nodeType: NodeType) => void
  ): void {
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
        listener(this.creationMode, this.selectedNodeType);
      } catch (error) {
        //
      }
    });
  }

  /**
   * 重置为选择模式
   */
  resetToSelectMode(): void {
    this.setCreationMode("select");
  }

  /**
   * 获取当前状态的描述
   */
  getStatusDescription(): string {
    switch (this.creationMode) {
      case "select":
        return "选择模式：点击选择节点";
      case "click":
        return `点击创建：点击画布创建${this.getNodeTypeLabel()}`;
      case "drag":
        return `拖拽创建：拖拽画布创建${this.getNodeTypeLabel()}`;
      default:
        return "未知模式";
    }
  }

  /**
   * 获取节点类型的中文标签
   */
  private getNodeTypeLabel(): string {
    switch (this.selectedNodeType) {
      case "rectangle":
        return "矩形";
      case "circle":
        return "圆形";
      case "text":
        return "文本";
      default:
        return "节点";
    }
  }
}

// 全局创建状态管理器实例
export const creationStore = new CreationStore();
