/**
 * React自定义渲染器模块
 *
 * 本模块实现了基于React reconciler的多宿主渲染器抽象设计
 * 支持Canvas2D、WebGL、CanvasKit等多种渲染后端
 *
 * 主要特性：
 * - 渲染器抽象层，支持多种宿主环境
 * - React组件化开发体验
 * - 统一的渲染节点树管理
 * - 高性能的增量更新
 */

// ========== 核心接口 ==========
export * from "./interfaces/IRenderer";

// ========== 渲染器实现 ==========
export * from "./renderers/Canvas2DRenderer";

// ========== React集成 ==========
export * from "./react/HostConfig";
export * from "./react/ReactRenderer";

// ========== 组件库 ==========
export * from "./components";

// ========== 工厂模式 ==========
export * from "./factory/RendererFactory";

// ========== 便捷创建函数 ==========
import { rendererFactory } from "./factory/RendererFactory";
import { ReactRenderer } from "./react/ReactRenderer";

/**
 * 创建Canvas React渲染器的便捷函数
 * @param canvas Canvas元素
 * @param rendererType 渲染器类型，默认为'canvas2d'
 * @param options 选项
 */
export function createCanvasRenderer(
  canvas: HTMLCanvasElement,
  rendererType: string = "canvas2d",
  options?: Record<string, unknown>
): ReactRenderer {
  console.log("🎨 创建Canvas React渲染器:", rendererType);

  // 创建底层渲染器
  const renderer = rendererFactory.createRenderer(
    rendererType,
    canvas,
    options
  );

  // 创建React渲染器封装
  const reactRenderer = new ReactRenderer(renderer);

  console.log("✅ Canvas React渲染器创建完成");
  return reactRenderer;
}

/**
 * 快速创建Canvas2D React渲染器
 * @param canvas Canvas元素
 * @param options 选项
 */
export function createCanvas2DRenderer(
  canvas: HTMLCanvasElement,
  options?: Record<string, unknown>
): ReactRenderer {
  return createCanvasRenderer(canvas, "canvas2d", options);
}

// ========== 全局渲染器工厂 ==========
export { rendererFactory } from "./factory/RendererFactory";
