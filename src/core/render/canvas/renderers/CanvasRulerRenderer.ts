import { IRulerRenderer } from "../../interfaces/IRenderer";
import { IGraphicsAPI } from "../../interfaces/IGraphicsAPI";

/**
 * Canvas 2D 标尺渲染器
 */
export class CanvasRulerRenderer implements IRulerRenderer {
  private rulerSize: number;
  private rulerColor: string;
  private textColor: string;
  private fontSize: number;

  constructor(
    rulerSize: number = 20,
    rulerColor: string = "#f0f0f0",
    textColor: string = "#666",
    fontSize: number = 10
  ) {
    this.rulerSize = rulerSize;
    this.rulerColor = rulerColor;
    this.textColor = textColor;
    this.fontSize = fontSize;
  }

  renderRulers(
    graphics: IGraphicsAPI,
    canvasSize: { width: number; height: number },
    viewState: { pageX: number; pageY: number; scale: number }
  ): void {
    this.renderHorizontalRuler(graphics, canvasSize, viewState);
    this.renderVerticalRuler(graphics, canvasSize, viewState);
  }

  /**
   * 渲染水平标尺
   */
  private renderHorizontalRuler(
    graphics: IGraphicsAPI,
    canvasSize: { width: number; height: number },
    viewState: { pageX: number; pageY: number; scale: number }
  ): void {
    const { scale, pageX } = viewState;

    // 绘制标尺背景
    graphics.setFillStyle(this.rulerColor);
    graphics.fillRect(0, 0, canvasSize.width, this.rulerSize);

    // 绘制标尺刻度
    graphics.setStrokeStyle(this.textColor);
    graphics.setLineWidth(1);

    const step = this.getStep(scale);
    const startX = Math.floor(-pageX / scale / step) * step;
    const endX = startX + canvasSize.width / scale + step;

    for (let x = startX; x <= endX; x += step) {
      const screenX = x * scale + pageX;

      if (screenX >= 0 && screenX <= canvasSize.width) {
        // 绘制刻度线
        graphics.beginPath();
        graphics.moveTo(screenX, this.rulerSize - 5);
        graphics.lineTo(screenX, this.rulerSize);
        graphics.stroke();

        // 绘制数值
        if (x % (step * 5) === 0) {
          graphics.setFillStyle(this.textColor);
          graphics.setFont(`${this.fontSize}px Arial`);
          graphics.setTextAlign("center");
          graphics.setTextBaseline("top");
          graphics.fillText(x.toString(), screenX, this.rulerSize - 15);
        }
      }
    }

    // 绘制标尺边框
    graphics.setStrokeStyle("#ccc");
    graphics.setLineWidth(1);
    graphics.beginPath();
    graphics.moveTo(0, this.rulerSize);
    graphics.lineTo(canvasSize.width, this.rulerSize);
    graphics.stroke();
  }

  /**
   * 渲染垂直标尺
   */
  private renderVerticalRuler(
    graphics: IGraphicsAPI,
    canvasSize: { width: number; height: number },
    viewState: { pageX: number; pageY: number; scale: number }
  ): void {
    const { scale, pageY } = viewState;

    // 绘制标尺背景
    graphics.setFillStyle(this.rulerColor);
    graphics.fillRect(0, 0, this.rulerSize, canvasSize.height);

    // 绘制标尺刻度
    graphics.setStrokeStyle(this.textColor);
    graphics.setLineWidth(1);

    const step = this.getStep(scale);
    const startY = Math.floor(-pageY / scale / step) * step;
    const endY = startY + canvasSize.height / scale + step;

    for (let y = startY; y <= endY; y += step) {
      const screenY = y * scale + pageY;

      if (screenY >= 0 && screenY <= canvasSize.height) {
        // 绘制刻度线
        graphics.beginPath();
        graphics.moveTo(this.rulerSize - 5, screenY);
        graphics.lineTo(this.rulerSize, screenY);
        graphics.stroke();

        // 绘制数值
        if (y % (step * 5) === 0) {
          graphics.save();
          graphics.translate(this.rulerSize - 8, screenY);
          graphics.rotate(-Math.PI / 2);

          graphics.setFillStyle(this.textColor);
          graphics.setFont(`${this.fontSize}px Arial`);
          graphics.setTextAlign("center");
          graphics.setTextBaseline("middle");
          graphics.fillText(y.toString(), 0, 0);

          graphics.restore();
        }
      }
    }

    // 绘制标尺边框
    graphics.setStrokeStyle("#ccc");
    graphics.setLineWidth(1);
    graphics.beginPath();
    graphics.moveTo(this.rulerSize, 0);
    graphics.lineTo(this.rulerSize, canvasSize.height);
    graphics.stroke();
  }

  /**
   * 根据缩放级别计算合适的刻度间隔
   */
  private getStep(scale: number): number {
    const baseStep = 25;
    if (scale >= 2) return baseStep / 2;
    if (scale >= 1) return baseStep;
    if (scale >= 0.5) return baseStep * 2;
    if (scale >= 0.25) return baseStep * 4;
    return baseStep * 8;
  }

  /**
   * 设置标尺尺寸
   */
  setRulerSize(size: number): void {
    this.rulerSize = size;
  }

  /**
   * 设置标尺颜色
   */
  setRulerColor(color: string): void {
    this.rulerColor = color;
  }

  /**
   * 获取标尺尺寸
   */
  getRulerSize(): number {
    return this.rulerSize;
  }
}
