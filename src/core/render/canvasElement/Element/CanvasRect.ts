import { RenderContext, ViewTransform } from "../types";
import { CanvasElement } from "./CanvasBaseElement";

/**
 * Canvas矩形元素
 * 模仿Skia的CkRect，直接渲染矩形
 */
export class CanvasRect extends CanvasElement<"canvas-rect"> {
  readonly type = "canvas-rect" as const;

  protected onRender(
    context: RenderContext,
    _viewTransform?: ViewTransform
  ): void {
    const { renderApi } = context;

    const visible = this.props.visible !== false;
    if (!visible) return;

    const x = (this.props.x as number) || 0;
    const y = (this.props.y as number) || 0;
    const w = (this.props.w as number) || 100;
    const h = (this.props.h as number) || 100;
    const fill = (this.props.fill as string) || "#eeffaa";
    const radius = (this.props.radius as number) || 0;

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
