import { RenderEngine } from "../types/render";

export class RenderManager {
  private renderEngine: RenderEngine | undefined;

  constructor(private container: HTMLElement) {}

  setRenderEngine(render: RenderEngine): void {
    if (this.renderEngine) {
      this.renderEngine.destroy();
    }
    this.renderEngine = render;
    this.renderEngine.init(this.container);
  }

  getRenderEngine() {
    return this.renderEngine as RenderEngine;
  }

  render(
    ctx: CanvasRenderingContext2D,
    scale: number,
    offset: { x: number; y: number }
  ): void {
    if (this.renderEngine) {
      this.renderEngine.render(ctx, scale, offset);
    }
  }

  clear(): void {
    if (this.renderEngine) {
      this.renderEngine.clear();
    }
  }

  destroy(): void {
    if (this.renderEngine) {
      this.renderEngine.destroy();
    }
  }
}
