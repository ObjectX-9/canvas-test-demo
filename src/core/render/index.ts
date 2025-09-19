// 所有Canvas相关的渲染器现在都在 ./canvas/ 目录中

// 导出通用渲染系统组件
export { RenderLoop } from "./RenderLoop";
export { DataObserver, globalDataObserver } from "./DataObserver";
export { RenderEngine, globalRenderEngine } from "./RenderEngine";
export { RenderRegistry, globalRenderRegistry } from "./RenderRegistry";
export { BaseNodeRenderer } from "./NodeRenderer";
export { RectangleRenderer, DefaultRenderer } from "./renderers";

// 导出Canvas 2D专用渲染系统
export * from "./canvas";

// 导出类型
export type { RenderCallback } from "./RenderLoop";
export type { DataChangeCallback } from "./DataObserver";
export type { INodeRenderer, RenderContext } from "./NodeRenderer";
