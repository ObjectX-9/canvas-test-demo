import { RenderContext, ViewTransform } from "../types";
import { CanvasElement } from "./CanvasBaseElement";

/**
 * Canvas容器元素
 * 用于组织和管理子元素
 */
export class CanvasContainer extends CanvasElement<"canvas-container"> {
  readonly type = "canvas-container" as const;

  protected onRender(
    _context: RenderContext,
    _viewTransform?: ViewTransform
  ): void {
    // 容器本身不渲染内容，只管理子元素
  }
}
