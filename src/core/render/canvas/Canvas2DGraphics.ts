import { IGraphicsAPI } from "../interfaces/IGraphicsAPI";

/**
 * Canvas 2D 图形API实现
 */
export class Canvas2DGraphics implements IGraphicsAPI {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  // 画布操作
  clearRect(x: number, y: number, width: number, height: number): void {
    this.ctx.clearRect(x, y, width, height);
  }

  fillRect(x: number, y: number, width: number, height: number): void {
    this.ctx.fillRect(x, y, width, height);
  }

  strokeRect(x: number, y: number, width: number, height: number): void {
    this.ctx.strokeRect(x, y, width, height);
  }

  // 路径操作
  beginPath(): void {
    this.ctx.beginPath();
  }

  closePath(): void {
    this.ctx.closePath();
  }

  moveTo(x: number, y: number): void {
    this.ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number): void {
    this.ctx.lineTo(x, y);
  }

  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise?: boolean
  ): void {
    this.ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
  }

  rect(x: number, y: number, width: number, height: number): void {
    this.ctx.rect(x, y, width, height);
  }

  // 绘制操作
  stroke(): void {
    this.ctx.stroke();
  }

  fill(): void {
    this.ctx.fill();
  }

  // 样式属性
  setFillStyle(style: string): void {
    this.ctx.fillStyle = style;
  }

  setStrokeStyle(style: string): void {
    this.ctx.strokeStyle = style;
  }

  setLineWidth(width: number): void {
    this.ctx.lineWidth = width;
  }

  setFont(font: string): void {
    this.ctx.font = font;
  }

  setTextAlign(align: "start" | "end" | "left" | "right" | "center"): void {
    this.ctx.textAlign = align;
  }

  setTextBaseline(
    baseline:
      | "alphabetic"
      | "top"
      | "hanging"
      | "middle"
      | "ideographic"
      | "bottom"
  ): void {
    this.ctx.textBaseline = baseline;
  }

  // 文本操作
  fillText(text: string, x: number, y: number, maxWidth?: number): void {
    this.ctx.fillText(text, x, y, maxWidth);
  }

  strokeText(text: string, x: number, y: number, maxWidth?: number): void {
    this.ctx.strokeText(text, x, y, maxWidth);
  }

  measureText(text: string): { width: number } {
    const metrics = this.ctx.measureText(text);
    return { width: metrics.width };
  }

  // 变换操作
  save(): void {
    this.ctx.save();
  }

  restore(): void {
    this.ctx.restore();
  }

  translate(x: number, y: number): void {
    this.ctx.translate(x, y);
  }

  rotate(angle: number): void {
    this.ctx.rotate(angle);
  }

  scale(scaleX: number, scaleY: number): void {
    this.ctx.scale(scaleX, scaleY);
  }

  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ): void {
    this.ctx.setTransform(a, b, c, d, e, f);
  }

  resetTransform(): void {
    this.ctx.resetTransform();
  }

  // 获取画布信息
  getCanvasSize(): { width: number; height: number } {
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }
}
