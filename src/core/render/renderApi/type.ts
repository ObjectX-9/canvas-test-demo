export interface RenderApi {
  // 画布相关
  scale(pixelRatio: number): void;
  setCanvasSize(width: number, height: number): void;
  translate(x: number, y: number): void;
  save(): void;
  restore(): void;

  // 绘制相关
  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ): void;
  clearRect(x: number, y: number, width: number, height: number): void;

  renderRect(rect: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;
  }): void;

  setFillStyle(style: string): void;

  setStrokeStyle(style: string): void;
  setLineWidth(width: number): void;

  stroke(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  beginPath(): void;

  setFont(font: string): void;
  setTextAlign(align: CanvasTextAlign): void;
  setTextBaseline(baseline: CanvasTextBaseline): void;

  fillText(text: string, x: number, y: number): void;

  rotate(angle: number): void;
}
