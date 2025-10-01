import { RenderContext, ViewTransform } from "../types";
import { CanvasElement } from "../Element/CanvasBaseElement";

/**
 * Canvas标尺UI元素
 * 根据视图变换动态显示坐标刻度
 * 这是一个UI辅助元素，没有对应的节点数据
 */
export class CanvasRuler extends CanvasElement<"canvas-ruler"> {
  readonly type = "canvas-ruler" as const;

  protected onRender(
    context: RenderContext,
    viewTransform?: ViewTransform
  ): void {
    const { ctx, canvas } = context;

    const rulerSize = (this.props.rulerSize as number) || 25;
    const backgroundColor = (this.props.backgroundColor as string) || "#f0f0f0";
    const textColor = (this.props.textColor as string) || "#333";
    const strokeStyle = (this.props.strokeStyle as string) || "#ccc";
    const visible = this.props.visible !== false;

    if (!visible) return;

    ctx.save();

    try {
      // 绘制标尺背景
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, rulerSize);
      ctx.fillRect(0, 0, rulerSize, canvas.height);

      // 绘制刻度
      this.drawRulerTicks(ctx, canvas, rulerSize, textColor, viewTransform);

      // 绘制边框
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, rulerSize);
      ctx.lineTo(canvas.width, rulerSize);
      ctx.moveTo(rulerSize, 0);
      ctx.lineTo(rulerSize, canvas.height);
      ctx.stroke();
    } finally {
      ctx.restore();
    }
  }

  private drawRulerTicks(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    rulerSize: number,
    textColor: string,
    viewTransform?: ViewTransform
  ): void {
    ctx.fillStyle = textColor;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const scale = viewTransform?.scale || 1;
    const offsetX = viewTransform?.offsetX || 0;
    const offsetY = viewTransform?.offsetY || 0;

    let tickInterval = 50;
    let minorTickInterval = 10;

    if (scale < 0.5) {
      tickInterval = 100;
      minorTickInterval = 20;
    } else if (scale > 2) {
      tickInterval = 25;
      minorTickInterval = 5;
    }

    const worldStartX = -offsetX / scale;
    const worldEndX = (canvas.width - offsetX) / scale;
    const worldStartY = -offsetY / scale;
    const worldEndY = (canvas.height - offsetY) / scale;

    // 水平标尺
    const startTickX =
      Math.floor(worldStartX / minorTickInterval) * minorTickInterval;
    const endTickX =
      Math.ceil(worldEndX / minorTickInterval) * minorTickInterval;

    for (
      let worldX = startTickX;
      worldX <= endTickX;
      worldX += minorTickInterval
    ) {
      const screenX = worldX * scale + offsetX;

      if (screenX >= rulerSize && screenX <= canvas.width) {
        const isMajorTick = worldX % tickInterval === 0;
        const tickHeight = isMajorTick ? 8 : 4;

        ctx.beginPath();
        ctx.moveTo(screenX, rulerSize - tickHeight);
        ctx.lineTo(screenX, rulerSize);
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (isMajorTick && Math.abs(worldX) > 0.1) {
          ctx.fillText(Math.round(worldX).toString(), screenX, rulerSize / 2);
        }
      }
    }

    // 垂直标尺
    const startTickY =
      Math.floor(worldStartY / minorTickInterval) * minorTickInterval;
    const endTickY =
      Math.ceil(worldEndY / minorTickInterval) * minorTickInterval;

    for (
      let worldY = startTickY;
      worldY <= endTickY;
      worldY += minorTickInterval
    ) {
      const screenY = worldY * scale + offsetY;

      if (screenY >= rulerSize && screenY <= canvas.height) {
        const isMajorTick = worldY % tickInterval === 0;
        const tickWidth = isMajorTick ? 8 : 4;

        ctx.beginPath();
        ctx.moveTo(rulerSize - tickWidth, screenY);
        ctx.lineTo(rulerSize, screenY);
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (isMajorTick && Math.abs(worldY) > 0.1) {
          ctx.save();
          ctx.translate(rulerSize / 2, screenY);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(Math.round(worldY).toString(), 0, 0);
          ctx.restore();
        }
      }
    }

    // 原点标记
    const originScreenX = 0 * scale + offsetX;
    const originScreenY = 0 * scale + offsetY;

    if (originScreenX >= rulerSize && originScreenX <= canvas.width) {
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(originScreenX - 1, 0, 2, rulerSize);
    }

    if (originScreenY >= rulerSize && originScreenY <= canvas.height) {
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, originScreenY - 1, rulerSize, 2);
    }
  }
}
