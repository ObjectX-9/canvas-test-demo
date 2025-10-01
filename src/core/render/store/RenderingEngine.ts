export enum RenderEngineType {
  CANVAS = "canvas",
  CANVASKIA = "canvasKit",
}
class RenderingEngine {
  curRenderEngine: RenderEngineType | null = null;

  setCurRenderEngine(engine: RenderEngineType) {
    this.curRenderEngine = engine;
  }

  getCurRenderEngine() {
    return this.curRenderEngine;
  }
}

export const renderingEngine = new RenderingEngine();
