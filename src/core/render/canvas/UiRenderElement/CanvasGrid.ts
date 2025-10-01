import { RenderContext, ViewTransform } from "../types";
import { CanvasElement } from "../Element/CanvasBaseElement";

/**
 * Canvas网格UI元素
 * 根据视图变换智能调整网格显示
 * 这是一个UI辅助元素，没有对应的节点数据
 */
export class CanvasGrid extends CanvasElement<"canvas-grid"> {
  readonly type = "canvas-grid" as const;

  protected onRender(
    context: RenderContext,
    viewTransform?: ViewTransform
  ): void {
    const { ctx, canvas } = context;

    const gridSize = (this.props.gridSize as number) || 20;
    const strokeStyle = (this.props.strokeStyle as string) || "#e0e0e0";
    const lineWidth = (this.props.lineWidth as number) || 1;
    const visible = this.props.visible !== false;

    if (!visible) return;

    ctx.save();

    try {
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;

      // 获取视图变换信息
      const scale = viewTransform?.scale || 1;
      const offsetX = viewTransform?.offsetX || 0;
      const offsetY = viewTransform?.offsetY || 0;

      // 根据缩放调整网格大小
      const scaledGridSize = gridSize * scale;

      // 如果网格太小或太大，就不绘制
      if (scaledGridSize < 5 || scaledGridSize > 200) {
        return;
      }

      // 计算起始绘制位置，确保网格对齐
      const startX =
        ((offsetX % scaledGridSize) + scaledGridSize) % scaledGridSize;
      const startY =
        ((offsetY % scaledGridSize) + scaledGridSize) % scaledGridSize;

      ctx.beginPath();

      // 绘制垂直线
      for (let x = startX; x <= canvas.width; x += scaledGridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }

      // 绘制水平线
      for (let y = startY; y <= canvas.height; y += scaledGridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }

      ctx.stroke();
    } finally {
      ctx.restore();
    }
  }
}
