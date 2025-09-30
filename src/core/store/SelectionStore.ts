// globalDataObserver已移除，数据变更由React状态系统处理

/**
 * 选择状态管理器
 * 负责管理当前选中的节点
 */
export class SelectionStore {
  private selectedNodeIds: Set<string> = new Set();
  private listeners: ((selectedIds: string[]) => void)[] = [];

  /**
   * 选中单个节点（清除其他选择）
   */
  selectNode(nodeId: string): void {
    this.selectedNodeIds.clear();
    this.selectedNodeIds.add(nodeId);
    this.notifyListeners();
  }

  /**
   * 切换节点选择状态
   */
  toggleNode(nodeId: string): void {
    if (this.selectedNodeIds.has(nodeId)) {
      this.selectedNodeIds.delete(nodeId);
    } else {
      this.selectedNodeIds.add(nodeId);
    }
    this.notifyListeners();
  }

  /**
   * 添加到选择（多选）
   */
  addToSelection(nodeId: string): void {
    this.selectedNodeIds.add(nodeId);
    this.notifyListeners();
  }

  /**
   * 取消选择
   */
  deselectNode(nodeId: string): void {
    this.selectedNodeIds.delete(nodeId);
    this.notifyListeners();
  }

  /**
   * 清除所有选择
   */
  clearSelection(): void {
    this.selectedNodeIds.clear();
    this.notifyListeners();
  }

  /**
   * 获取选中的节点ID列表
   */
  getSelectedNodeIds(): string[] {
    return Array.from(this.selectedNodeIds);
  }

  /**
   * 获取第一个选中的节点ID
   */
  getFirstSelectedNodeId(): string | null {
    const first = this.selectedNodeIds.values().next();
    return first.done ? null : first.value;
  }

  /**
   * 检查节点是否被选中
   */
  isNodeSelected(nodeId: string): boolean {
    return this.selectedNodeIds.has(nodeId);
  }

  /**
   * 添加选择变化监听器
   */
  addSelectionListener(listener: (selectedIds: string[]) => void): void {
    this.listeners.push(listener);
  }

  /**
   * 移除选择变化监听器
   */
  removeSelectionListener(listener: (selectedIds: string[]) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    const selectedIds = this.getSelectedNodeIds();
    this.listeners.forEach((listener) => listener(selectedIds));

    // 通知渲染系统更新选中框显示
    // 数据变更由React状态系统处理
    console.log("选择状态已更新");
  }
}

// 全局选择管理器实例
export const selectionStore = new SelectionStore();
