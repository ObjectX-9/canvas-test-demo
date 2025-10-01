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
    const { ctx } = context;

    const visible = this.props.visible !== false;
    if (!visible) return;

    const x = (this.props.x as number) || 0;
    const y = (this.props.y as number) || 0;
    const w = (this.props.w as number) || 100;
    const h = (this.props.h as number) || 100;
    const fill = (this.props.fill as string) || "#eeffaa";
    const radius = (this.props.radius as number) || 0;

    ctx.save();

    try {
      // 设置填充颜色
      ctx.fillStyle = fill;

      // 绘制矩形
      if (radius > 0) {
        // 圆角矩形
        this.drawRoundedRect(ctx, x, y, w, h, radius);
        ctx.fill();
      } else {
        // 普通矩形
        ctx.fillRect(x, y, w, h);
      }

      // 绘制边框
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      if (radius > 0) {
        this.drawRoundedRect(ctx, x, y, w, h, radius);
        ctx.stroke();
      } else {
        ctx.strokeRect(x, y, w, h);
      }
    } finally {
      ctx.restore();
    }
  }

  /**
   * 绘制圆角矩形路径
   */
  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}
