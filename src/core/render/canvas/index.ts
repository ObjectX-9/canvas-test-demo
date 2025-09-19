import { CanvasRenderEngine } from "./CanvasRenderEngine";
import { CanvasRenderer } from "./CanvasRenderer";

// 导出Canvas 2D相关类
export { CanvasRenderEngine } from "./CanvasRenderEngine";
export { CanvasRenderer } from "./CanvasRenderer";

// 创建全局Canvas渲染引擎实例
export const globalCanvasRenderEngine = new CanvasRenderEngine();

// 便捷函数
export function createCanvasRenderer() {
  return new CanvasRenderer();
}

/**
 * 初始化Canvas渲染系统
 * @param canvas Canvas元素
 * @returns 初始化后的Canvas渲染引擎
 */
export async function initializeCanvasRenderSystem(canvas: HTMLCanvasElement) {
  globalCanvasRenderEngine.initializeCanvas(canvas);
  return globalCanvasRenderEngine;
}
