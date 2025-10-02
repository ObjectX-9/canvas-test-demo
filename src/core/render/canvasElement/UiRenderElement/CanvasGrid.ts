import { RenderContext, ViewTransform, RenderMode } from "../types";
import { CanvasElement } from "../Element/CanvasBaseElement";
import { CanvasGridProps } from "../../canvasReconciler/CanvasElementFactory";

/**
 * Canvas网格UI元素
 * 根据视图变换智能调整网格显示
 * 这是一个UI辅助元素，没有对应的节点数据
 */
export class CanvasGrid extends CanvasElement<"canvas-grid", CanvasGridProps> {
  readonly type = "canvas-grid" as const;

  protected onRender(
    context: RenderContext,
    _viewTransform?: ViewTransform
  ): void {
    const { renderApi, actualWidth, actualHeight, viewTransform, pixelRatio } =
      context;

    const gridSize = this.props.gridSize || 20;
    const strokeStyle = this.props.strokeStyle || "#e0e0e0";
    const lineWidth = this.props.lineWidth || 1;
    const visible = this.props.visible !== false;

    if (!visible) return;

    renderApi.save();

    // 切换到屏幕坐标模式（网格应该在屏幕坐标系绘制）
    renderApi.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    try {
      renderApi.setStrokeStyle(strokeStyle);
      renderApi.setLineWidth(lineWidth);

      // 使用上下文中的视图变换信息
      const { scale, offsetX, offsetY } = viewTransform;

      // 计算缩放后的网格大小
      const scaledGridSize = gridSize * scale;

      // 如果网格太小或太大，就不绘制
      if (scaledGridSize < 2 || scaledGridSize > 200) {
        return;
      }

      // 计算起始绘制位置，确保网格对齐
      const startX =
        ((offsetX % scaledGridSize) + scaledGridSize) % scaledGridSize;
      const startY =
        ((offsetY % scaledGridSize) + scaledGridSize) % scaledGridSize;

      renderApi.beginPath();

      // 绘制垂直线（屏幕坐标）
      for (let x = startX; x <= actualWidth; x += scaledGridSize) {
        renderApi.moveTo(x, 0);
        renderApi.lineTo(x, actualHeight);
      }

      // 绘制水平线（屏幕坐标）
      for (let y = startY; y <= actualHeight; y += scaledGridSize) {
        renderApi.moveTo(0, y);
        renderApi.lineTo(actualWidth, y);
      }

      renderApi.stroke();
    } finally {
      renderApi.restore();
    }
  }
}
