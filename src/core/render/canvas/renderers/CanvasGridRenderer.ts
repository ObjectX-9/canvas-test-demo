import { IGridRenderer } from "../../interfaces/IRenderer";
import { IGraphicsAPI } from "../../interfaces/IGraphicsAPI";

/**
 * Canvas 2D 网格渲染器
 */
export class CanvasGridRenderer implements IGridRenderer {
  private gridSize: number;
  private gridColor: string;

  constructor(gridSize: number = 25, gridColor: string = "#ddd") {
    this.gridSize = gridSize;
    this.gridColor = gridColor;
  }

  renderGrid(
    graphics: IGraphicsAPI,
    canvasSize: { width: number; height: number },
    viewState: { pageX: number; pageY: number; scale: number }
  ): void {
    const { pageX, pageY, scale } = viewState;
    const step = this.gridSize;

    graphics.setStrokeStyle(this.gridColor);
    graphics.setLineWidth(1 / scale);

    const viewportWidth = canvasSize.width / scale;
    const viewportHeight = canvasSize.height / scale;

    const startX = Math.floor(-pageX / scale / step) * step;
    const startY = Math.floor(-pageY / scale / step) * step;
    const endX = startX + viewportWidth + step;
    const endY = startY + viewportHeight + step;

    // 绘制垂直线
    for (let x = startX; x <= endX; x += step) {
      graphics.beginPath();
      graphics.moveTo(x, startY);
      graphics.lineTo(x, endY);
      graphics.stroke();
    }

    // 绘制水平线
    for (let y = startY; y <= endY; y += step) {
      graphics.beginPath();
      graphics.moveTo(startX, y);
      graphics.lineTo(endX, y);
      graphics.stroke();
    }
  }

  /**
   * 设置网格大小
   */
  setGridSize(size: number): void {
    this.gridSize = size;
  }

  /**
   * 设置网格颜色
   */
  setGridColor(color: string): void {
    this.gridColor = color;
  }
}
