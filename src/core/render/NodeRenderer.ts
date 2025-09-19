import { BaseNode } from "../nodeTree/node/baseNode";
import { IRenderContext } from "./interfaces/IGraphicsAPI";

// RenderContext已移除，直接使用IRenderContext

/**
 * 节点渲染器接口
 */
export interface INodeRenderer<T extends BaseNode = BaseNode> {
  /**
   * 渲染器类型标识
   */
  type: string;

  /**
   * 检查是否可以渲染指定节点
   * @param node 要检查的节点
   */
  canRender(node: BaseNode): boolean;
  render(node: BaseNode, context: IRenderContext): boolean;
  getPriority(): number;

  /**
   * 获取渲染优先级
   */
  priority: number;

  /**
   * 渲染节点的核心方法
   * @param node 要渲染的节点
   * @param context 渲染上下文
   */
  render(node: T, context: IRenderContext): void;
}

/**
 * 基础节点渲染器抽象类
 */
export abstract class BaseNodeRenderer<T extends BaseNode = BaseNode>
  implements INodeRenderer<T>
{
  abstract readonly type: string;
  abstract priority: number;

  abstract canRender(node: BaseNode): boolean;
  abstract renderNode(node: BaseNode, context: IRenderContext): boolean;
  abstract getSupportedNodeTypes(): string[];

  render(node: BaseNode, context: IRenderContext): boolean {
    try {
      if (!this.canRender(node)) {
        return false;
      }
      return this.renderNode(node as T, context);
    } catch (error) {
      console.error(`渲染器 ${this.type} 渲染节点失败:`, error);
      return false;
    }
  }

  getPriority(): number {
    return this.priority;
  }

  /**
   * 辅助方法：在保存/恢复图形状态的情况下执行渲染
   */
  protected withGraphicsState(
    context: IRenderContext,
    callback: () => void
  ): void {
    const { graphics } = context;
    graphics.save();
    try {
      callback();
    } finally {
      graphics.restore();
    }
  }

  /**
   * 辅助方法：应用变换
   */
  protected applyTransform(context: IRenderContext, node: BaseNode): void {
    const { graphics } = context;

    // 应用位置变换
    graphics.translate(node.x, node.y);

    // 应用旋转（如果有的话）
    if (node.rotation && node.rotation !== 0) {
      graphics.translate(node.w / 2, node.h / 2);
      graphics.rotate((node.rotation * Math.PI) / 180);
      graphics.translate(-node.w / 2, -node.h / 2);
    }
  }

  /**
   * 辅助方法：应用节点变换
   */
  protected applyNodeTransform(node: T, context: IRenderContext): void {
    const { graphics } = context;

    // 应用位置变换
    graphics.translate(node.x + node.w / 2, node.y + node.h / 2);

    // 应用旋转
    if (node.rotation !== 0) {
      graphics.rotate((node.rotation * Math.PI) / 180);
    }

    // 移回原点
    graphics.translate(-node.w / 2, -node.h / 2);
  }
}
