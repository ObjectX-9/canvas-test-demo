import { BaseNode } from "../nodeTree/node/baseNode";
import { coordinateSystemManager } from "../manage/CoordinateSystemManager";

/**
 * 视口信息接口
 */
export interface ViewportInfo {
  visibleBounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  };
  zoomLevel: number;
  canvasSize: {
    width: number;
    height: number;
  };
}

/**
 * 视口感知的空间网格系统
 * 🎯 核心优化：只为当前视口区域维护网格，显著减少内存和计算开销
 */
export class ViewportAwareSpatialGrid {
  private grid: Map<string, BaseNode[]> = new Map();
  private currentViewport: ViewportInfo | null = null;
  private adaptiveCellSize: number = 200;
  private gridBounds: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  } | null = null;

  // 性能统计
  private stats = {
    totalCells: 0,
    activeCells: 0,
    memoryEfficiency: 0,
    lastRebuildTime: 0,
    rebuildCount: 0,
  };

  /**
   * 更新视口信息，智能决定是否重建网格
   */
  updateViewport(canvas: HTMLCanvasElement): boolean {
    const newViewport = this.calculateCurrentViewport(canvas);

    if (this.shouldRebuildGrid(newViewport)) {
      console.log("🔄 重建视口网格:", {
        oldZoom: this.currentViewport?.zoomLevel || 0,
        newZoom: newViewport.zoomLevel,
        oldBounds: this.gridBounds,
        newBounds: newViewport.visibleBounds,
      });

      this.rebuildForViewport(newViewport);
      return true;
    }

    return false;
  }

  /**
   * 计算当前视口信息
   */
  private calculateCurrentViewport(canvas: HTMLCanvasElement): ViewportInfo {
    const rect = canvas.getBoundingClientRect();
    const canvasWidth = rect.width;
    const canvasHeight = rect.height;

    // 计算视口四个角的世界坐标
    const topLeft = coordinateSystemManager.screenToWorld(0, 0);
    const bottomRight = coordinateSystemManager.screenToWorld(
      canvasWidth,
      canvasHeight
    );

    // 获取当前缩放级别
    const zoomLevel = this.getCurrentZoomLevel();

    return {
      visibleBounds: {
        left: topLeft.x,
        top: topLeft.y,
        right: bottomRight.x,
        bottom: bottomRight.y,
      },
      zoomLevel,
      canvasSize: {
        width: canvasWidth,
        height: canvasHeight,
      },
    };
  }

  /**
   * 获取当前缩放级别
   */
  private getCurrentZoomLevel(): number {
    const viewState = coordinateSystemManager.getViewState();
    // 从变换矩阵中提取缩放比例
    return Math.sqrt(viewState.matrix[0] ** 2 + viewState.matrix[1] ** 2);
  }

  /**
   * 智能判断是否需要重建网格
   */
  private shouldRebuildGrid(newViewport: ViewportInfo): boolean {
    if (!this.currentViewport || !this.gridBounds) {
      return true; // 首次初始化
    }

    // 1. 缩放变化检测
    const zoomChange = Math.abs(
      newViewport.zoomLevel - this.currentViewport.zoomLevel
    );
    const zoomThreshold = 0.3; // 缩放变化30%时重建
    if (zoomChange / this.currentViewport.zoomLevel > zoomThreshold) {
      console.log(`🔍 缩放变化触发重建: ${zoomChange.toFixed(2)}`);
      return true;
    }

    // 2. 视口移动检测
    const bounds = newViewport.visibleBounds;
    const currentBounds = this.gridBounds;

    // 检查视口是否移出当前网格范围
    const margin = this.adaptiveCellSize * 2; // 提前2个格子的缓冲区
    if (
      bounds.left < currentBounds.left + margin ||
      bounds.right > currentBounds.right - margin ||
      bounds.top < currentBounds.top + margin ||
      bounds.bottom > currentBounds.bottom - margin
    ) {
      console.log("📐 视口移出网格范围，触发重建");
      return true;
    }

    // 3. 网格利用率检测
    const utilization =
      this.stats.activeCells / Math.max(this.stats.totalCells, 1);
    if (utilization < 0.2) {
      // 利用率低于20%时重建
      console.log(`📊 网格利用率过低: ${(utilization * 100).toFixed(1)}%`);
      return true;
    }

    // 4. 时间间隔检测（防止频繁重建）
    const timeSinceLastRebuild = Date.now() - this.stats.lastRebuildTime;
    if (timeSinceLastRebuild < 1000) {
      // 1秒内不重复重建
      return false;
    }

    return false;
  }

  /**
   * 为新视口重建网格
   */
  private rebuildForViewport(viewport: ViewportInfo): void {
    const startTime = performance.now();

    // 清空现有网格
    this.grid.clear();

    // 根据缩放级别调整网格大小
    this.adaptiveCellSize = this.getAdaptiveCellSize(viewport.zoomLevel);

    // 扩展视口边界，包含缓冲区
    const buffer = this.adaptiveCellSize * 3; // 3个格子的缓冲区
    this.gridBounds = {
      left: viewport.visibleBounds.left - buffer,
      top: viewport.visibleBounds.top - buffer,
      right: viewport.visibleBounds.right + buffer,
      bottom: viewport.visibleBounds.bottom + buffer,
    };

    // 计算网格尺寸统计
    const gridWidth = this.gridBounds.right - this.gridBounds.left;
    const gridHeight = this.gridBounds.bottom - this.gridBounds.top;
    const cols = Math.ceil(gridWidth / this.adaptiveCellSize);
    const rows = Math.ceil(gridHeight / this.adaptiveCellSize);

    // 更新统计信息
    this.stats.totalCells = cols * rows;
    this.stats.activeCells = 0;
    this.stats.lastRebuildTime = Date.now();
    this.stats.rebuildCount++;

    // 保存当前视口
    this.currentViewport = viewport;

    const rebuildTime = performance.now() - startTime;
    console.log("🔄 视口网格重建完成:", {
      cellSize: this.adaptiveCellSize,
      totalCells: this.stats.totalCells,
      gridSize: `${cols}x${rows}`,
      rebuildTime: `${rebuildTime.toFixed(2)}ms`,
      rebuildCount: this.stats.rebuildCount,
    });
  }

  /**
   * 根据缩放级别计算自适应网格大小
   */
  private getAdaptiveCellSize(zoomLevel: number): number {
    const baseCellSize = 200;

    // 缩放越大，网格越小（更精确）
    // 缩放越小，网格越大（减少内存）
    const adaptedSize = baseCellSize / Math.sqrt(Math.max(zoomLevel, 0.1));

    // 限制在合理范围内
    return Math.max(50, Math.min(500, adaptedSize));
  }

  /**
   * 获取网格单元键（视口相对坐标）
   */
  private getCellKey(x: number, y: number): string {
    if (!this.gridBounds) return "0,0";

    const col = Math.floor((x - this.gridBounds.left) / this.adaptiveCellSize);
    const row = Math.floor((y - this.gridBounds.top) / this.adaptiveCellSize);
    return `${col},${row}`;
  }

  /**
   * 检查点是否在当前网格范围内
   */
  private isPointInGrid(x: number, y: number): boolean {
    if (!this.gridBounds) return false;

    return (
      x >= this.gridBounds.left &&
      x <= this.gridBounds.right &&
      y >= this.gridBounds.top &&
      y <= this.gridBounds.bottom
    );
  }

  /**
   * 添加节点到网格
   */
  addNode(node: BaseNode): void {
    // 只添加在视口范围内的节点
    if (!this.isNodeInViewport(node)) {
      return;
    }

    const cells = this.getCellsForNode(node);
    let added = false;

    cells.forEach((cellKey) => {
      if (!this.grid.has(cellKey)) {
        this.grid.set(cellKey, []);
        this.stats.activeCells++;
      }
      this.grid.get(cellKey)!.push(node);
      added = true;
    });

    // 更新内存效率统计
    if (added) {
      this.stats.memoryEfficiency =
        this.stats.activeCells / this.stats.totalCells;
    }
  }

  /**
   * 检查节点是否在视口范围内
   */
  private isNodeInViewport(node: BaseNode): boolean {
    if (!this.gridBounds) return false;

    return !(
      node.x + node.w < this.gridBounds.left ||
      node.x > this.gridBounds.right ||
      node.y + node.h < this.gridBounds.top ||
      node.y > this.gridBounds.bottom
    );
  }

  /**
   * 获取节点覆盖的网格单元
   */
  private getCellsForNode(node: BaseNode): string[] {
    if (!this.gridBounds) return [];

    const cells: string[] = [];
    const left = Math.floor(
      (node.x - this.gridBounds.left) / this.adaptiveCellSize
    );
    const right = Math.floor(
      (node.x + node.w - this.gridBounds.left) / this.adaptiveCellSize
    );
    const top = Math.floor(
      (node.y - this.gridBounds.top) / this.adaptiveCellSize
    );
    const bottom = Math.floor(
      (node.y + node.h - this.gridBounds.top) / this.adaptiveCellSize
    );

    for (let col = left; col <= right; col++) {
      for (let row = top; row <= bottom; row++) {
        cells.push(`${col},${row}`);
      }
    }
    return cells;
  }

  /**
   * 获取点附近的候选节点
   */
  getCandidateNodes(point: { x: number; y: number }): BaseNode[] {
    if (!this.isPointInGrid(point.x, point.y)) {
      return []; // 点不在视口网格范围内
    }

    const cellKey = this.getCellKey(point.x, point.y);
    return this.grid.get(cellKey) || [];
  }

  /**
   * 获取矩形区域内的候选节点
   */
  getCandidateNodesInRect(rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): BaseNode[] {
    if (!this.gridBounds) return [];

    const nodes = new Set<BaseNode>();

    const leftCol = Math.floor(
      (rect.x - this.gridBounds.left) / this.adaptiveCellSize
    );
    const rightCol = Math.floor(
      (rect.x + rect.width - this.gridBounds.left) / this.adaptiveCellSize
    );
    const topRow = Math.floor(
      (rect.y - this.gridBounds.top) / this.adaptiveCellSize
    );
    const bottomRow = Math.floor(
      (rect.y + rect.height - this.gridBounds.top) / this.adaptiveCellSize
    );

    for (let col = leftCol; col <= rightCol; col++) {
      for (let row = topRow; row <= bottomRow; row++) {
        const cellKey = `${col},${row}`;
        const cellNodes = this.grid.get(cellKey);
        if (cellNodes) {
          cellNodes.forEach((node) => nodes.add(node));
        }
      }
    }

    return Array.from(nodes);
  }

  /**
   * 重建网格（用于节点变化时）
   */
  rebuild(nodes: BaseNode[]): void {
    if (!this.currentViewport) return;

    this.grid.clear();
    this.stats.activeCells = 0;

    nodes.forEach((node) => this.addNode(node));

    console.log("🔄 网格重建完成:", {
      totalNodes: nodes.length,
      gridNodes: Array.from(this.grid.values()).flat().length,
      activeCells: this.stats.activeCells,
      memoryEfficiency: `${(this.stats.memoryEfficiency * 100).toFixed(1)}%`,
    });
  }

  /**
   * 清空网格
   */
  clear(): void {
    this.grid.clear();
    this.stats.activeCells = 0;
    this.stats.memoryEfficiency = 0;
  }

  /**
   * 获取性能统计
   */
  getStats() {
    return {
      ...this.stats,
      currentCellSize: this.adaptiveCellSize,
      currentZoom: this.currentViewport?.zoomLevel || 0,
      gridRange: this.gridBounds,
    };
  }
}
