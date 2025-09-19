import { IGraphicsAPI } from "./IGraphicsAPI";

/**
 * 网格渲染器接口
 */
export interface IGridRenderer {
  /**
   * 渲染网格
   * @param graphics 图形API
   * @param canvasSize 画布尺寸
   * @param viewState 视图状态
   */
  renderGrid(
    graphics: IGraphicsAPI,
    canvasSize: { width: number; height: number },
    viewState: { pageX: number; pageY: number; scale: number }
  ): void;
}

/**
 * 标尺渲染器接口
 */
export interface IRulerRenderer {
  /**
   * 渲染标尺
   * @param graphics 图形API
   * @param canvasSize 画布尺寸
   * @param viewState 视图状态
   */
  renderRulers(
    graphics: IGraphicsAPI,
    canvasSize: { width: number; height: number },
    viewState: { pageX: number; pageY: number; scale: number }
  ): void;
}

/**
 * 页面背景渲染器接口
 */
export interface IBackgroundRenderer {
  /**
   * 渲染页面背景
   * @param graphics 图形API
   * @param canvasSize 画布尺寸
   * @param backgroundColor 背景颜色
   */
  renderBackground(
    graphics: IGraphicsAPI,
    canvasSize: { width: number; height: number },
    backgroundColor: string
  ): void;
}
