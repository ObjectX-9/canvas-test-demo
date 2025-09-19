import { IBackgroundRenderer } from "../../interfaces/IRenderer";
import { IGraphicsAPI } from "../../interfaces/IGraphicsAPI";

/**
 * Canvas 2D 背景渲染器
 */
export class CanvasBackgroundRenderer implements IBackgroundRenderer {
  renderBackground(
    graphics: IGraphicsAPI,
    canvasSize: { width: number; height: number },
    backgroundColor: string
  ): void {
    graphics.setFillStyle(backgroundColor);
    graphics.fillRect(0, 0, canvasSize.width, canvasSize.height);
  }
}
