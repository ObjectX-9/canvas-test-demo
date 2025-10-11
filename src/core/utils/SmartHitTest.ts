import { BaseNode } from "../nodeTree/node/baseNode";
import { ViewportAwareSpatialGrid } from "./ViewportAwareSpatialGrid";

/**
 * 节点选择优先级
 */
export interface NodePriority {
  node: BaseNode;
  priority: number;
  distance: number;
  area: number;
  depth: number;
}

/**
 * 选择模式
 */
export enum SelectionMode {
  INTERSECTS = "intersects", // 相交即选中（默认）
  CONTAINS = "contains", // 完全包含才选中
  CENTER = "center", // 中心点在选择框内
}

/**
 * 空间网格分区系统
 * 用于优化大量节点的性能
 */
export class SpatialGrid {
  private grid: Map<string, BaseNode[]> = new Map();
  private readonly cellSize: number;
  private bounds: { x: number; y: number; width: number; height: number };

  constructor(
    cellSize = 200,
    bounds = { x: 0, y: 0, width: 10000, height: 10000 }
  ) {
    this.cellSize = cellSize;
    this.bounds = bounds;
  }

  /**
   * 获取网格单元的键
   */
  private getCellKey(x: number, y: number): string {
    const col = Math.floor((x - this.bounds.x) / this.cellSize);
    const row = Math.floor((y - this.bounds.y) / this.cellSize);
    return `${col},${row}`;
  }

  /**
   * 获取节点覆盖的所有网格单元
   */
  private getCellsForNode(node: BaseNode): string[] {
    const cells: string[] = [];
    const left = Math.floor((node.x - this.bounds.x) / this.cellSize);
    const right = Math.floor((node.x + node.w - this.bounds.x) / this.cellSize);
    const top = Math.floor((node.y - this.bounds.y) / this.cellSize);
    const bottom = Math.floor(
      (node.y + node.h - this.bounds.y) / this.cellSize
    );

    for (let col = left; col <= right; col++) {
      for (let row = top; row <= bottom; row++) {
        cells.push(`${col},${row}`);
      }
    }
    return cells;
  }

  /**
   * 添加节点到空间网格
   */
  addNode(node: BaseNode): void {
    const cells = this.getCellsForNode(node);
    cells.forEach((cellKey) => {
      if (!this.grid.has(cellKey)) {
        this.grid.set(cellKey, []);
      }
      this.grid.get(cellKey)!.push(node);
    });
  }

  /**
   * 从空间网格中移除节点
   */
  removeNode(node: BaseNode): void {
    const cells = this.getCellsForNode(node);
    cells.forEach((cellKey) => {
      const nodeList = this.grid.get(cellKey);
      if (nodeList) {
        const index = nodeList.findIndex((n) => n.id === node.id);
        if (index !== -1) {
          nodeList.splice(index, 1);
        }
        if (nodeList.length === 0) {
          this.grid.delete(cellKey);
        }
      }
    });
  }

  /**
   * 获取点位置附近的候选节点
   */
  getCandidateNodes(point: { x: number; y: number }): BaseNode[] {
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
    const nodes = new Set<BaseNode>();

    const leftCol = Math.floor((rect.x - this.bounds.x) / this.cellSize);
    const rightCol = Math.floor(
      (rect.x + rect.width - this.bounds.x) / this.cellSize
    );
    const topRow = Math.floor((rect.y - this.bounds.y) / this.cellSize);
    const bottomRow = Math.floor(
      (rect.y + rect.height - this.bounds.y) / this.cellSize
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
   * 清空网格
   */
  clear(): void {
    this.grid.clear();
  }

  /**
   * 重建网格（当节点发生大量变化时）
   */
  rebuild(nodes: BaseNode[]): void {
    this.clear();
    nodes.forEach((node) => this.addNode(node));
  }
}

/**
 * Figma风格的智能碰撞检测系统
 */
export class SmartHitTest {
  private spatialGrid: SpatialGrid;
  private viewportGrid: ViewportAwareSpatialGrid;
  private performanceMode = false;
  private useViewportOptimization = true; // 🎯 新增：启用视口优化
  private lastRebuildTime = 0;
  private readonly REBUILD_INTERVAL = 5000; // 5秒重建一次空间网格
  private currentCanvas: HTMLCanvasElement | null = null;

  constructor(cellSize = 200) {
    this.spatialGrid = new SpatialGrid(cellSize);
    this.viewportGrid = new ViewportAwareSpatialGrid();
  }

  /**
   * 初始化或重建空间网格
   */
  initialize(nodes: BaseNode[], canvas?: HTMLCanvasElement): void {
    // 🎯 优先使用视口感知网格
    if (this.useViewportOptimization && canvas) {
      this.currentCanvas = canvas;
      const viewportChanged = this.viewportGrid.updateViewport(canvas);

      if (viewportChanged) {
        this.viewportGrid.rebuild(nodes);
        console.log(`🌐 视口网格已重建，包含 ${nodes.length} 个节点`);
        return;
      }
    }

    // 备用：传统全局网格
    const now = Date.now();
    if (
      now - this.lastRebuildTime > this.REBUILD_INTERVAL ||
      this.spatialGrid.getCandidateNodes({ x: 0, y: 0 }).length === 0
    ) {
      this.spatialGrid.rebuild(nodes);
      this.lastRebuildTime = now;
      console.log(`🌐 空间网格已重建，包含 ${nodes.length} 个节点`);
    }
  }

  /**
   * 快速AABB预检测
   */
  private quickAABBTest(
    point: { x: number; y: number },
    node: BaseNode
  ): boolean {
    // 为旋转节点扩展包围盒
    const margin = node.rotation !== 0 ? Math.max(node.w, node.h) * 0.3 : 0;
    return (
      point.x >= node.x - margin &&
      point.x <= node.x + node.w + margin &&
      point.y >= node.y - margin &&
      point.y <= node.y + node.h + margin
    );
  }

  /**
   * 精确的点在矩形内检测（支持旋转）
   */
  private isPointInRectangle(
    point: { x: number; y: number },
    node: BaseNode
  ): boolean {
    const { x, y, w, h, rotation } = node;

    if (!rotation || rotation === 0) {
      // 快速路径：无旋转的AABB检测
      return (
        point.x >= x && point.x <= x + w && point.y >= y && point.y <= y + h
      );
    }

    // 精确路径：支持旋转的OBB检测
    const centerX = x + w / 2;
    const centerY = y + h / 2;

    // 将点转换到节点的本地坐标系
    const relativeX = point.x - centerX;
    const relativeY = point.y - centerY;

    // 应用反向旋转矩阵
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);

    const rotatedX = relativeX * cos - relativeY * sin;
    const rotatedY = relativeX * sin + relativeY * cos;

    // 在本地坐标系中进行AABB检测
    return (
      rotatedX >= -w / 2 &&
      rotatedX <= w / 2 &&
      rotatedY >= -h / 2 &&
      rotatedY <= h / 2
    );
  }

  /**
   * 计算节点选择优先级
   * 基于Figma的智能选择策略
   */
  private calculatePriority(
    point: { x: number; y: number },
    node: BaseNode
  ): NodePriority {
    // 基础优先级
    let priority = 0;

    // 1. 节点类型优先级
    switch (node.type) {
      case "text":
        priority += 100; // 文本节点最高优先级
        break;
      case "rectangle":
        priority += 50;
        break;
      default:
        priority += 30;
    }

    // 2. 节点大小优先级（小节点优先）
    const area = node.w * node.h;
    const areaScore = Math.max(0, 50 - Math.log10(area + 1) * 10);
    priority += areaScore;

    // 3. 距离中心点的距离（越近优先级越高）
    const centerX = node.x + node.w / 2;
    const centerY = node.y + node.h / 2;
    const distance = Math.sqrt(
      Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2)
    );
    const distanceScore = Math.max(0, 20 - distance / 10);
    priority += distanceScore;

    // 4. 边缘优先（点击靠近边缘的小节点优先）
    const edgeDistanceX = Math.min(point.x - node.x, node.x + node.w - point.x);
    const edgeDistanceY = Math.min(point.y - node.y, node.y + node.h - point.y);
    const edgeDistance = Math.min(edgeDistanceX, edgeDistanceY);
    if (edgeDistance < 10) {
      priority += 15; // 边缘点击奖励
    }

    return {
      node,
      priority,
      distance,
      area,
      depth: 0, // TODO: 实现层级深度计算
    };
  }

  /**
   * 智能点选检测
   * 返回最适合的节点
   */
  findBestNodeAtPoint(
    point: { x: number; y: number },
    allNodes: BaseNode[],
    canvas?: HTMLCanvasElement
  ): BaseNode | null {
    this.initialize(allNodes, canvas);

    // 第一步：空间分区预筛选
    let candidates: BaseNode[];

    if (this.useViewportOptimization && this.currentCanvas) {
      // 🎯 使用视口感知网格
      candidates = this.viewportGrid.getCandidateNodes(point);
      console.log(`🎯 视口网格候选: ${candidates.length}/${allNodes.length}`);
    } else if (this.performanceMode) {
      // 传统空间分区
      candidates = this.spatialGrid.getCandidateNodes(point);
    } else {
      // 全节点遍历
      candidates = allNodes;
    }

    if (candidates.length === 0) {
      return null;
    }

    console.log(`🎯 候选节点: ${candidates.length}/${allNodes.length}`);

    // 第二步：AABB预检测
    const aabbCandidates = candidates.filter((node) =>
      this.quickAABBTest(point, node)
    );

    if (aabbCandidates.length === 0) {
      return null;
    }

    // 第三步：精确几何检测 + 优先级计算
    const validNodes: NodePriority[] = [];

    for (const node of aabbCandidates) {
      if (this.isPointInRectangle(point, node)) {
        const priority = this.calculatePriority(point, node);
        validNodes.push(priority);
      }
    }

    if (validNodes.length === 0) {
      return null;
    }

    // 第四步：智能选择最佳节点
    validNodes.sort((a, b) => b.priority - a.priority);

    const selectedNode = validNodes[0].node;
    console.log(
      `🏆 选中节点: ${selectedNode.id} (${
        selectedNode.type
      }) 优先级: ${validNodes[0].priority.toFixed(1)}`
    );

    return selectedNode;
  }

  /**
   * 矩形选择检测
   * 支持多种选择模式
   */
  findNodesInRectangle(
    selectionRect: { x: number; y: number; width: number; height: number },
    allNodes: BaseNode[],
    mode: SelectionMode = SelectionMode.INTERSECTS,
    canvas?: HTMLCanvasElement
  ): BaseNode[] {
    this.initialize(allNodes, canvas);

    // 空间分区预筛选
    let candidates: BaseNode[];

    if (this.useViewportOptimization && this.currentCanvas) {
      // 🎯 使用视口感知网格
      candidates = this.viewportGrid.getCandidateNodesInRect(selectionRect);
      console.log(
        `📦 视口网格框选候选: ${candidates.length}/${allNodes.length}`
      );
    } else if (this.performanceMode) {
      // 传统空间分区
      candidates = this.spatialGrid.getCandidateNodesInRect(selectionRect);
    } else {
      // 全节点遍历
      candidates = allNodes;
    }

    const selectedNodes: BaseNode[] = [];
    const left = selectionRect.x;
    const right = selectionRect.x + selectionRect.width;
    const top = selectionRect.y;
    const bottom = selectionRect.y + selectionRect.height;

    for (const node of candidates) {
      const nodeLeft = node.x;
      const nodeRight = node.x + node.w;
      const nodeTop = node.y;
      const nodeBottom = node.y + node.h;

      let isSelected = false;

      switch (mode) {
        case SelectionMode.CONTAINS:
          // 节点完全在选择框内
          isSelected =
            nodeLeft >= left &&
            nodeRight <= right &&
            nodeTop >= top &&
            nodeBottom <= bottom;
          break;

        case SelectionMode.CENTER:
          // 节点中心点在选择框内
          // eslint-disable-next-line no-case-declarations
          const centerX = nodeLeft + node.w / 2;
          // eslint-disable-next-line no-case-declarations
          const centerY = nodeTop + node.h / 2;
          isSelected =
            centerX >= left &&
            centerX <= right &&
            centerY >= top &&
            centerY <= bottom;
          break;

        case SelectionMode.INTERSECTS:
        default:
          // 相交即选中（默认）
          isSelected = !(
            nodeRight < left ||
            nodeLeft > right ||
            nodeBottom < top ||
            nodeTop > bottom
          );
          break;
      }

      if (isSelected) {
        selectedNodes.push(node);
      }
    }

    console.log(`📦 框选结果: ${selectedNodes.length} 个节点 (模式: ${mode})`);
    return selectedNodes;
  }

  /**
   * 性能模式切换
   */
  setPerformanceMode(enabled: boolean): void {
    this.performanceMode = enabled;
    console.log(`⚡ 性能模式: ${enabled ? "开启" : "关闭"}`);
  }

  /**
   * 视口优化切换
   */
  setViewportOptimization(enabled: boolean): void {
    this.useViewportOptimization = enabled;
    console.log(`🎯 视口优化: ${enabled ? "开启" : "关闭"}`);
  }

  /**
   * 获取网格统计信息
   */
  getGridStats() {
    return {
      viewportGrid: this.viewportGrid.getStats(),
      spatialGrid: {
        useViewportOptimization: this.useViewportOptimization,
        performanceMode: this.performanceMode,
      },
    };
  }

  /**
   * 添加节点到空间网格
   */
  addNode(node: BaseNode): void {
    this.spatialGrid.addNode(node);
  }

  /**
   * 从空间网格移除节点
   */
  removeNode(node: BaseNode): void {
    this.spatialGrid.removeNode(node);
  }
}

// 全局智能碰撞检测实例
export const smartHitTest = new SmartHitTest();
