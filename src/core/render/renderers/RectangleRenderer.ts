import { Rectangle } from "../../nodeTree/node/rectangle";
import { BaseNodeRenderer, RenderContext } from "../NodeRenderer";

/**
 * 矩形节点渲染器
 */
export class RectangleRenderer extends BaseNodeRenderer<Rectangle> {
  readonly type = "rectangle";
  priority = 10;

  render(node: Rectangle, context: RenderContext): void {
    const { ctx } = context;

    this.withCanvasState(context, () => {
      // 应用节点变换
      this.applyNodeTransform(node, context);

      // 绘制矩形主体
      ctx.fillStyle = node.fill;
      ctx.fillRect(0, 0, node.w, node.h);

      // 绘制边框
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, node.w, node.h);

      // 如果有圆角，绘制圆角矩形
      if (node.radius > 0) {
        this.drawRoundedRect(ctx, 0, 0, node.w, node.h, node.radius, node.fill);
      }

      // 绘制节点ID标识
      this.drawNodeLabel(node, ctx);
    });
  }

  /**
   * 绘制圆角矩形
   */
  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle: string
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

    ctx.fillStyle = fillStyle;
    ctx.fill();
    ctx.stroke();
  }

  /**
   * 绘制节点标签
   */
  private drawNodeLabel(node: Rectangle, ctx: CanvasRenderingContext2D): void {
    // 设置文字样式
    ctx.fillStyle = "#000";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 绘制节点ID
    const centerX = node.w / 2;
    const centerY = node.h / 2;
    ctx.fillText(node.id, centerX, centerY);
  }

  /**
   * 检查点是否在矩形内（用于碰撞检测）
   */
  isPointInside(node: Rectangle, x: number, y: number): boolean {
    return (
      x >= node.x && x <= node.x + node.w && y >= node.y && y <= node.y + node.h
    );
  }

  /**
   * 获取矩形边界框
   */
  getBounds(node: Rectangle): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return {
      x: node.x,
      y: node.y,
      width: node.w,
      height: node.h,
    };
  }
}
