import { RenderApi } from "../renderApi/type";

/**
 * 渲染上下文接口
 */
export interface RenderContext {
  canvas: HTMLCanvasElement;
  renderApi: RenderApi;
  pixelRatio: number;
  // 实际的画布尺寸（已考虑像素比）
  actualWidth: number;
  actualHeight: number;
  // 当前视图变换信息
  viewTransform: ViewTransform;
}

/**
 * 视图变换信息接口
 */
export interface ViewTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/**
 * 渲染模式枚举
 */
export enum RenderMode {
  WORLD = "world", // 世界坐标模式，自动应用视图变换
  SCREEN = "screen", // 屏幕坐标模式，不应用视图变换
}
