import { Rectangle } from "../../nodeTree/node/rectangle";

export interface RenderEngine {
  init(container: HTMLElement): void;
  render(
    ctx: CanvasRenderingContext2D,
    scale: number,
    offset: { x: number; y: number }
  ): void;
  clear(): void;
  destroy(): void;
  drawRectangle(node: Rectangle): void;
}
