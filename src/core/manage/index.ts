/**
 * Core管理模块入口
 * 导出所有管理器
 */

export {
  CoordinateSystemManager,
  coordinateSystemManager,
} from "./CoordinateSystemManager";

export { PageManager, pageManager } from "./PageManager";

// RulerManager已删除，现在使用CanvasRulerRenderer

export type { IUniformScale, DirectKey } from "../utils/uniformScale";
