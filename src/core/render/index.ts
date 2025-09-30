/**
 * 节点树Canvas渲染器模块
 *
 * 基于Skia架构思路的双层渲染系统：
 * - 数据层 (BaseNode): 管理节点数据和业务逻辑
 * - 渲染层 (RenderElement): 专注Canvas绘制和渲染
 * - 懒加载桥梁 (renderDom): 按需创建渲染对象
 *
 * 主要特性：
 * - 双层架构设计，关注点分离
 * - 懒加载渲染对象，性能优化
 * - 渲染缓存机制，减少重复创建
 * - 基于Canvas2D的高性能渲染
 * - 类似Skia的声明式UI组件系统
 */

// ========== 节点树Canvas渲染器 ==========
export { NodeTreeCanvasRenderer } from "./canvas/NodeTreeCanvasRenderer";

// ========== 渲染元素系统 ==========
export {
  RenderElement,
  RectRenderElement,
  PageRenderElement,
  ContainerRenderElement,
  RenderElementFactory,
} from "./canvas/RenderElement";

// ========== UI渲染元素系统 ==========
export {
  UIRenderElement,
  GridRenderElement,
  RulerRenderElement,
  BackgroundRenderElement,
} from "./canvas/UIRenderElement";

// ========== Canvas组件系统 ==========
export { Canvas, Grid, Ruler, Background } from "./canvas/CanvasComponent";

// ========== 类型定义 ==========
export type { RenderContext } from "./canvas/RenderElement";
export type { UIRenderProps } from "./canvas/UIRenderElement";
export type {
  CanvasComponentProps,
  CanvasComponentRef,
  GridProps,
  RulerProps,
  BackgroundProps,
} from "./canvas/CanvasComponent";
