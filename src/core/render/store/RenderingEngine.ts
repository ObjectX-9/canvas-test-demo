export enum RenderEngineType {
  CANVAS = "canvas",
  CANVASKIA = "canvasKit",
}
class RenderingEngine {
  curRenderEngine: RenderEngineType | null = null;

  canvas: HTMLCanvasElement | null = null;

  setCurRenderEngine(engine: RenderEngineType) {
    this.curRenderEngine = engine;
  }

  getCurRenderEngine() {
    return this.curRenderEngine;
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  getCanvas() {
    return this.canvas;
  }
}

export const renderingEngine = new RenderingEngine();
