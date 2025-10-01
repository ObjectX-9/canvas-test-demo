/**
 * 简化的Canvas渲染器模块
 *
 * 去除中间抽象层，直接使用Canvas进行渲染：
 * - CanvasElement: 直接操作Canvas的渲染元素
 * - SkiaLikeRenderer: 简化的渲染器，直接管理Canvas
 * - JSX直接元素: <canvas-grid>, <canvas-ruler>等
 *
 * 主要特性：
 * - 简化架构，去除不必要的抽象层
 * - 直接Canvas操作，高性能渲染
 * - 完全模仿Skia的JSX元素使用方式
 * - 类型安全，无any类型
 *
 * 文件结构：
 * - canvas/Element/: 容器、节点树等有逻辑的元素
 * - canvas/UIRenderElement/: 网格、标尺等纯UI元素
 * - direct/: Skia风格的渲染器和工厂
 */

// UI元素类型（纯UI，无节点数据）
export { CanvasGrid, CanvasRuler } from "./canvasElement/UiRenderElement";

// 基础类型
export type { RenderContext, ViewTransform } from "./canvasElement/types";

// ========== Skia风格直接渲染器 ==========
export {
  SkiaLikeRenderer,
  createSkiaLikeRenderer,
} from "./canvasReconciler/SkiaLikeRenderer";
export {
  createCanvasElement,
  type CanvasElementType,
  type CanvasElementProps,
} from "./canvasReconciler/CanvasElementFactory";

// 辅助函数
export { getMainCanvasElement } from "./helper";
