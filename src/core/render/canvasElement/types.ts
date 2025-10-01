import { RenderApi } from "../renderApi/type";

/**
 * 渲染上下文接口
 */
export interface RenderContext {
  canvas: HTMLCanvasElement;
  renderApi: RenderApi;
  pixelRatio: number;
}

/**
 * 视图变换信息接口
 */
export interface ViewTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}
