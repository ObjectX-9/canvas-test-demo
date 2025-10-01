import { RenderContext, ViewTransform } from "../types";
import { CanvasElement } from "../Element/CanvasBaseElement";
import { RenderApi } from "../../renderApi/type";

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
    const { renderApi, canvas } = context;

    const rulerSize = (this.props.rulerSize as number) || 25;
    const backgroundColor = (this.props.backgroundColor as string) || "#f0f0f0";
    const textColor = (this.props.textColor as string) || "#333";
    const strokeStyle = (this.props.strokeStyle as string) || "#ccc";
    const visible = this.props.visible !== false;

    if (!visible) return;

    renderApi.save();

    try {
      // 绘制标尺背景
      renderApi.setFillStyle(backgroundColor);
      renderApi.renderRect({
        x: 0,
        y: 0,
        width: canvas.width,
        height: rulerSize,
      });
      renderApi.renderRect({
        x: 0,
        y: 0,
        width: rulerSize,
        height: canvas.height,
      });

      // 绘制刻度
      this.drawRulerTicks(
        renderApi,
        canvas,
        rulerSize,
        textColor,
        viewTransform
      );

      // 绘制边框
      renderApi.setStrokeStyle(strokeStyle);
      renderApi.setLineWidth(1);
      renderApi.beginPath();
      renderApi.moveTo(0, rulerSize);
      renderApi.lineTo(canvas.width, rulerSize);
      renderApi.moveTo(rulerSize, 0);
      renderApi.lineTo(rulerSize, canvas.height);
      renderApi.stroke();
    } finally {
      renderApi.restore();
    }
  }

  private drawRulerTicks(
    renderApi: RenderApi,
    canvas: HTMLCanvasElement,
    rulerSize: number,
    textColor: string,
    viewTransform?: ViewTransform
  ): void {
    renderApi.setFillStyle(textColor);
    renderApi.setFont("10px sans-serif");
    renderApi.setTextAlign("center");
    renderApi.setTextBaseline("middle");

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

        renderApi.beginPath();
        renderApi.moveTo(screenX, rulerSize - tickHeight);
        renderApi.lineTo(screenX, rulerSize);
        renderApi.setStrokeStyle(textColor);
        renderApi.setLineWidth(1);
        renderApi.stroke();

        if (isMajorTick && Math.abs(worldX) > 0.1) {
          renderApi.fillText(
            Math.round(worldX).toString(),
            screenX,
            rulerSize / 2
          );
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

        renderApi.beginPath();
        renderApi.moveTo(rulerSize - tickWidth, screenY);
        renderApi.lineTo(rulerSize, screenY);
        renderApi.setStrokeStyle(textColor);
        renderApi.setLineWidth(1);
        renderApi.stroke();

        if (isMajorTick && Math.abs(worldY) > 0.1) {
          renderApi.save();
          renderApi.translate(rulerSize / 2, screenY);
          renderApi.rotate(-Math.PI / 2);
          renderApi.fillText(Math.round(worldY).toString(), 0, 0);
          renderApi.restore();
        }
      }
    }

    // 原点标记
    const originScreenX = 0 * scale + offsetX;
    const originScreenY = 0 * scale + offsetY;

    if (originScreenX >= rulerSize && originScreenX <= canvas.width) {
      renderApi.setFillStyle("#ff0000");
      renderApi.renderRect({
        x: originScreenX - 1,
        y: 0,
        width: 2,
        height: rulerSize,
      });
    }

    if (originScreenY >= rulerSize && originScreenY <= canvas.height) {
      renderApi.setFillStyle("#ff0000");
      renderApi.renderRect({
        x: 0,
        y: originScreenY - 1,
        width: rulerSize,
        height: 2,
      });
    }
  }
}
