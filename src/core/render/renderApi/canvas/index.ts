class CanvasRenderApi {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  scale(pixelRatioX: number, pixelRatioY?: number) {
    this.ctx.scale(pixelRatioX, pixelRatioY || pixelRatioX);
  }

  translate(x: number, y: number) {
    this.ctx.translate(x, y);
  }

  save() {
    this.ctx.save();
  }

  restore() {
    this.ctx.restore();
  }

  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number
  ) {
    this.ctx.setTransform(a, b, c, d, e, f);
  }

  setFillStyle(style: string) {
    this.ctx.fillStyle = style;
  }

  clearRect(x: number, y: number, width: number, height: number) {
    this.ctx.clearRect(x, y, width, height);
  }

  setCanvasSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  renderRect(rect: {
    x: number;
    y: number;
    width: number;
    height: number;
    radius?: number;
  }) {
    if (rect.radius && rect.radius > 0) {
      // 绘制圆角矩形
      this.ctx.beginPath();
      this.ctx.moveTo(rect.x + rect.radius, rect.y);
      this.ctx.lineTo(rect.x + rect.width - rect.radius, rect.y);
      this.ctx.quadraticCurveTo(
        rect.x + rect.width,
        rect.y,
        rect.x + rect.width,
        rect.y + rect.radius
      );
      this.ctx.lineTo(rect.x + rect.width, rect.y + rect.height - rect.radius);
      this.ctx.quadraticCurveTo(
        rect.x + rect.width,
        rect.y + rect.height,
        rect.x + rect.width - rect.radius,
        rect.y + rect.height
      );
      this.ctx.lineTo(rect.x + rect.radius, rect.y + rect.height);
      this.ctx.quadraticCurveTo(
        rect.x,
        rect.y + rect.height,
        rect.x,
        rect.y + rect.height - rect.radius
      );
      this.ctx.lineTo(rect.x, rect.y + rect.radius);
      this.ctx.quadraticCurveTo(rect.x, rect.y, rect.x + rect.radius, rect.y);
      this.ctx.closePath();
      this.ctx.fill();
    } else {
      // 绘制普通矩形
      this.ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    }
  }

  setStrokeStyle(style: string) {
    this.ctx.strokeStyle = style;
  }

  setLineWidth(width: number) {
    this.ctx.lineWidth = width;
  }

  stroke() {
    this.ctx.stroke();
  }

  moveTo(x: number, y: number) {
    this.ctx.moveTo(x, y);
  }

  lineTo(x: number, y: number) {
    this.ctx.lineTo(x, y);
  }

  beginPath() {
    this.ctx.beginPath();
  }

  setFont(font: string) {
    this.ctx.font = font;
  }

  setTextAlign(align: CanvasTextAlign) {
    this.ctx.textAlign = align;
  }

  setTextBaseline(baseline: CanvasTextBaseline) {
    this.ctx.textBaseline = baseline;
  }

  fillText(text: string, x: number, y: number) {
    this.ctx.fillText(text, x, y);
  }

  rotate(angle: number) {
    this.ctx.rotate(angle);
  }
}

export default CanvasRenderApi;
