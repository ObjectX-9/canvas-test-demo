import { RenderContext, ViewTransform, RenderMode } from "../types";
import { CanvasElement } from "../Element/CanvasBaseElement";
import { RenderApi } from "../../renderApi/type";
import { CanvasRulerProps } from "../../canvasReconciler/CanvasElementFactory";

/**
 * Canvas标尺UI元素
 * 根据视图变换动态显示坐标刻度
 * 这是一个UI辅助元素，没有对应的节点数据
 */
export class CanvasRuler extends CanvasElement<
  "canvas-ruler",
  CanvasRulerProps
> {
  readonly type = "canvas-ruler" as const;

  protected onRender(
    context: RenderContext,
    _viewTransform?: ViewTransform
  ): void {
    const { renderApi, actualWidth, actualHeight, viewTransform, pixelRatio } =
      context;

    const rulerSize = this.props.rulerSize || 25;
    const backgroundColor = this.props.backgroundColor || "#f0f0f0";
    const textColor = this.props.textColor || "#333";
    const strokeStyle = this.props.strokeStyle || "#ccc";
    const visible = this.props.visible !== false;

    if (!visible) return;

    // 标尺需要在屏幕坐标系绘制，所以需要临时重置变换
    renderApi.save();

    // 重置变换为单位矩阵，只保留像素比缩放，使标尺始终固定在屏幕边缘
    renderApi.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    try {
      // 绘制标尺背景
      renderApi.setFillStyle(backgroundColor);
      renderApi.renderRect({
        x: 0,
        y: 0,
        width: actualWidth,
        height: rulerSize,
      });
      renderApi.renderRect({
        x: 0,
        y: 0,
        width: rulerSize,
        height: actualHeight,
      });

      // 绘制刻度（需要考虑当前的视图变换）
      this.drawRulerTicks(
        renderApi,
        actualWidth,
        actualHeight,
        rulerSize,
        textColor,
        viewTransform
      );

      // 绘制边框
      renderApi.setStrokeStyle(strokeStyle);
      renderApi.setLineWidth(1);
      renderApi.beginPath();
      renderApi.moveTo(0, rulerSize);
      renderApi.lineTo(actualWidth, rulerSize);
      renderApi.moveTo(rulerSize, 0);
      renderApi.lineTo(rulerSize, actualHeight);
      renderApi.stroke();
    } finally {
      renderApi.restore();
    }
  }

  private drawRulerTicks(
    renderApi: RenderApi,
    canvasWidth: number,
    canvasHeight: number,
    rulerSize: number,
    textColor: string,
    viewTransform: ViewTransform
  ): void {
    renderApi.setFillStyle(textColor);
    renderApi.setFont("12px sans-serif");
    renderApi.setTextAlign("center");
    renderApi.setTextBaseline("middle");

    const { scale, offsetX, offsetY } = viewTransform;

    // 根据缩放级别调整刻度间距
    let tickInterval = 100; // 主刻度间距
    let minorTickInterval = 20; // 次刻度间距

    if (scale < 0.3) {
      tickInterval = 500;
      minorTickInterval = 100;
    } else if (scale < 0.5) {
      tickInterval = 200;
      minorTickInterval = 50;
    } else if (scale > 3) {
      tickInterval = 50;
      minorTickInterval = 10;
    } else if (scale > 1.5) {
      tickInterval = 100;
      minorTickInterval = 20;
    }

    // 计算世界坐标范围
    const worldStartX = -offsetX / scale;
    const worldEndX = (canvasWidth - offsetX) / scale;
    const worldStartY = -offsetY / scale;
    const worldEndY = (canvasHeight - offsetY) / scale;

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

      if (screenX >= rulerSize && screenX <= canvasWidth) {
        const isMajorTick = worldX % tickInterval === 0;
        const tickHeight = isMajorTick ? 12 : 6;

        renderApi.beginPath();
        renderApi.moveTo(screenX, rulerSize - tickHeight);
        renderApi.lineTo(screenX, rulerSize);
        renderApi.setStrokeStyle(textColor);
        renderApi.setLineWidth(1);
        renderApi.stroke();

        if (isMajorTick && Math.abs(worldX) >= 0.1) {
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

      if (screenY >= rulerSize && screenY <= canvasHeight) {
        const isMajorTick = worldY % tickInterval === 0;
        const tickWidth = isMajorTick ? 12 : 6;

        renderApi.beginPath();
        renderApi.moveTo(rulerSize - tickWidth, screenY);
        renderApi.lineTo(rulerSize, screenY);
        renderApi.setStrokeStyle(textColor);
        renderApi.setLineWidth(1);
        renderApi.stroke();

        if (isMajorTick && Math.abs(worldY) >= 0.1) {
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

    if (originScreenX >= rulerSize && originScreenX <= canvasWidth) {
      renderApi.setFillStyle("#ff0000");
      renderApi.renderRect({
        x: originScreenX - 2,
        y: 0,
        width: 4,
        height: rulerSize,
      });
    }

    if (originScreenY >= rulerSize && originScreenY <= canvasHeight) {
      renderApi.setFillStyle("#ff0000");
      renderApi.renderRect({
        x: 0,
        y: originScreenY - 2,
        width: rulerSize,
        height: 4,
      });
    }
  }
}
