import { BaseState } from "./baseState";

/**
 * 路径点接口
 */
export interface PathPoint {
  x: number;
  y: number;
  pressure?: number; // 笔触压力，用于变粗细
}

/**
 * 铅笔节点状态接口
 */
export interface PencilState extends BaseState {
  /** 路径点数组 */
  points: PathPoint[];
  /** 笔触宽度 */
  strokeWidth: number;
  /** 笔触颜色 */
  strokeColor: string;
  /** 线条样式 */
  lineCap: "round" | "square" | "butt";
  /** 线条连接样式 */
  lineJoin: "round" | "bevel" | "miter";
  /** 是否完成绘制 */
  finished: boolean;
  /** 平滑度 */
  smoothness: number;
}
