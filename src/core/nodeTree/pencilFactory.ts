import { Pencil } from "./node/pencil";
import { PencilState, PathPoint } from "../types/nodes/pencilState";
import { nodeTree } from "./index";

/**
 * 铅笔创建配置选项
 */
export interface PencilCreateOptions {
  strokeWidth?: number;
  strokeColor?: string;
  lineCap?: "round" | "square" | "butt";
  lineJoin?: "round" | "bevel" | "miter";
  smoothness?: number;
  points?: PathPoint[];
  startX?: number;
  startY?: number;
}

/**
 * 铅笔节点工厂类
 */
export class PencilFactory {
  /**
   * 创建新的铅笔节点
   */
  static create(options: PencilCreateOptions = {}): Pencil {
    const {
      strokeWidth = 2,
      strokeColor = "#000000",
      lineCap = "round",
      lineJoin = "round",
      smoothness = 0.5,
      points = [],
      startX = 0,
      startY = 0,
    } = options;

    const pencilId = this.generateId();

    const pencilState: PencilState = {
      id: pencilId,
      type: "pencil",
      name: "铅笔",
      x: startX,
      y: startY,
      w: 0,
      h: 0,
      rotation: 0,
      fill: "transparent",
      points: points.length > 0 ? [...points] : [{ x: startX, y: startY }],
      strokeWidth,
      strokeColor,
      lineCap,
      lineJoin,
      finished: points.length > 0, // 如果有初始点，认为是已完成的
      smoothness,
    };

    return new Pencil(pencilState);
  }

  /**
   * 从现有状态创建铅笔节点
   */
  static fromState(state: PencilState): Pencil {
    return new Pencil(state);
  }

  /**
   * 创建并添加到节点树
   */
  static createAndAdd(options: PencilCreateOptions = {}): Pencil {
    const pencil = this.create(options);
    nodeTree.addNode(pencil._state);
    return pencil;
  }

  /**
   * 从路径点数组创建铅笔节点
   */
  static fromPoints(
    points: PathPoint[],
    options: Omit<PencilCreateOptions, "points" | "startX" | "startY"> = {}
  ): Pencil {
    if (points.length === 0) {
      throw new Error("至少需要一个路径点");
    }

    const firstPoint = points[0];
    return this.create({
      ...options,
      points,
      startX: firstPoint.x,
      startY: firstPoint.y,
    });
  }

  /**
   * 从SVG路径字符串创建铅笔节点（简化版）
   */
  static fromSVGPath(
    svgPath: string,
    options: Omit<PencilCreateOptions, "points"> = {}
  ): Pencil {
    // 这里是一个简化的SVG路径解析器
    // 实际使用中可能需要更完整的SVG路径解析
    const points = this.parseSVGPath(svgPath);
    return this.fromPoints(points, options);
  }

  /**
   * 创建预设样式的铅笔节点
   */
  static createPreset(
    preset: "thin" | "medium" | "thick" | "marker" | "brush",
    options: Omit<
      PencilCreateOptions,
      "strokeWidth" | "lineCap" | "lineJoin"
    > = {}
  ): Pencil {
    const presets = {
      thin: {
        strokeWidth: 1,
        lineCap: "round" as const,
        lineJoin: "round" as const,
      },
      medium: {
        strokeWidth: 3,
        lineCap: "round" as const,
        lineJoin: "round" as const,
      },
      thick: {
        strokeWidth: 6,
        lineCap: "round" as const,
        lineJoin: "round" as const,
      },
      marker: {
        strokeWidth: 4,
        lineCap: "square" as const,
        lineJoin: "bevel" as const,
      },
      brush: {
        strokeWidth: 8,
        lineCap: "round" as const,
        lineJoin: "round" as const,
      },
    };

    return this.create({
      ...presets[preset],
      ...options,
    });
  }

  /**
   * 生成唯一ID
   */
  private static generateId(): string {
    return `pencil_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 简化的SVG路径解析器
   */
  private static parseSVGPath(svgPath: string): PathPoint[] {
    const points: PathPoint[] = [];

    // 匹配M和L命令的简单正则
    const commands = svgPath.match(/[ML]\s*[-\d.,\s]+/g) || [];

    for (const command of commands) {
      const type = command[0];
      const coords = command
        .slice(1)
        .trim()
        .split(/[,\s]+/)
        .map(Number);

      if (type === "M" || type === "L") {
        for (let i = 0; i < coords.length; i += 2) {
          if (i + 1 < coords.length) {
            points.push({ x: coords[i], y: coords[i + 1] });
          }
        }
      }
    }

    return points;
  }
}

/**
 * 便捷函数 - 创建铅笔节点
 */
export function createPencil(options?: PencilCreateOptions): Pencil {
  return PencilFactory.create(options);
}

/**
 * 便捷函数 - 创建并添加铅笔节点到节点树
 */
export function addPencil(options?: PencilCreateOptions): Pencil {
  return PencilFactory.createAndAdd(options);
}

/**
 * 便捷函数 - 从点数组创建铅笔
 */
export function pencilFromPoints(
  points: PathPoint[],
  options?: Omit<PencilCreateOptions, "points" | "startX" | "startY">
): Pencil {
  return PencilFactory.fromPoints(points, options);
}
