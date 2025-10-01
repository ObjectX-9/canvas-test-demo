import { RenderContext, ViewTransform } from "../types";
import { CanvasElement } from "./CanvasBaseElement";
import { CanvasRectProps } from "../../canvasReconciler/CanvasElementFactory";

/**
 * Canvas矩形元素
 * 模仿Skia的CkRect，直接渲染矩形
 */
export class CanvasRect extends CanvasElement<"canvas-rect", CanvasRectProps> {
  readonly type = "canvas-rect" as const;

  protected onRender(
    context: RenderContext,
    _viewTransform?: ViewTransform
  ): void {
    const { renderApi } = context;

    const { jsNode } = this.props;

    if (!jsNode) return;

    const visible = this.props.visible !== false;
    if (!visible) return;

    const x = jsNode.x || 0;
    const y = jsNode.y || 0;
    const w = jsNode.w || 100;
    const h = jsNode.h || 100;
    const fill = jsNode.fill || "#eeffaa";
    const radius = jsNode.radius || 0;

    renderApi.save();

    try {
      // 设置填充颜色
      renderApi.setFillStyle(fill);

      renderApi.renderRect({ x, y, width: w, height: h, radius });
    } finally {
      renderApi.restore();
    }
  }
}
