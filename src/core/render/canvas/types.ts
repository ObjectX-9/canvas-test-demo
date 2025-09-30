/**
 * 渲染上下文接口
 */
export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
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
