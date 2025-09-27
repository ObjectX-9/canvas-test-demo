/**
 * Core管理模块入口
 * 导出所有管理器
 */

export {
  CoordinateSystemManager,
  coordinateSystemManager,
} from "./CoordinateSystemManager";

export { PageManager, pageManager } from "./PageManager";

export { ViewManager, viewManager } from "./ViewManager";

export type { IUniformScale, DirectKey } from "../utils/uniformScale";
