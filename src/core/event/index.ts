/**
 * 新的事件系统 - 主要导出
 * 完全独立于React生命周期，基于依赖注入设计
 */

import { EventSystem } from "./EventSystem";
import { EventSystemInitializer } from "./EventSystemInitializer";

// 导出新的事件系统
export { EventSystem, EventSystemInitializer };

// 导出类型定义
export * from "./types";

// 导出处理器和中间件
export * from "./middlewares";

// 创建全局实例
export const eventSystemInitializer = new EventSystemInitializer();
