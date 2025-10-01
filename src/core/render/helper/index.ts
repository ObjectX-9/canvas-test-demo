import { renderingEngine } from "../store/RenderingEngine";

export function getMainCanvasElement() {
  const canvas = renderingEngine.getCanvas();
  if (!canvas) {
    throw new Error("无法获取画布元素");
  }
  return canvas;
}
