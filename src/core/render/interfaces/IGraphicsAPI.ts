/**
 * 抽象图形API接口
 * 定义了所有基础的绘图操作，不绑定到具体的渲染技术
 */
export interface IGraphicsAPI {
  // 画布操作
  clearRect(x: number, y: number, width: number, height: number): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  strokeRect(x: number, y: number, width: number, height: number): void;

  // 路径操作
  beginPath(): void;
  closePath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    anticlockwise?: boolean
  ): void;
  rect(x: number, y: number, width: number, height: number): void;

  // 绘制操作
  stroke(): void;
  fill(): void;

  // 样式属性
  setFillStyle(style: string): void;
  setStrokeStyle(style: string): void;
  setLineWidth(width: number): void;
  setFont(font: string): void;
  setTextAlign(align: "start" | "end" | "left" | "right" | "center"): void;
  setTextBaseline(
    baseline:
      | "alphabetic"
      | "top"
      | "hanging"
      | "middle"
      | "ideographic"
      | "bottom"
  ): void;

  // 文本操作
  fillText(text: string, x: number, y: number, maxWidth?: number): void;
  strokeText(text: string, x: number, y: number, maxWidth?: number): void;
  measureText(text: string): { width: number };

  // 变换操作
  save(): void;
  restore(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(scaleX: number, scaleY: number): void;
  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ): void;
  resetTransform(): void;

  // 获取画布信息
  getCanvasSize(): { width: number; height: number };
}

/**
 * 渲染上下文接口
 * 包含渲染所需的所有上下文信息
 */
export interface IRenderContext {
  graphics: IGraphicsAPI;
  canvasSize: { width: number; height: number };
  viewMatrix: number[];
  scale: number;
}
