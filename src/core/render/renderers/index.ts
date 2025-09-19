// 导出所有渲染器
export { RectangleRenderer } from "./RectangleRenderer";
export { DefaultRenderer } from "./DefaultRenderer";

// 导出渲染器工厂函数
import { RectangleRenderer } from "./RectangleRenderer";
import { DefaultRenderer } from "./DefaultRenderer";
import { INodeRenderer } from "../NodeRenderer";

/**
 * 创建所有内置渲染器实例
 */
export function createBuiltinRenderers(): INodeRenderer[] {
  return [new RectangleRenderer(), new DefaultRenderer()];
}

/**
 * 获取默认渲染器实例
 */
export function createDefaultRenderer(): DefaultRenderer {
  return new DefaultRenderer();
}
