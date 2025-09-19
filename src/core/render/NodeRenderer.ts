import { BaseNode } from "../nodeTree/node/baseNode";

/**
 * 渲染上下文接口
 */
export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  viewMatrix?: any; // 视图变换矩阵
  scale?: number; // 缩放比例
}

/**
 * 节点渲染器接口
 */
export interface INodeRenderer<T extends BaseNode = BaseNode> {
  /**
   * 渲染器类型标识
   */
  readonly type: string;

  /**
   * 渲染节点
   * @param node 要渲染的节点
   * @param context 渲染上下文
   */
  render(node: T, context: RenderContext): void;

  /**
   * 检查是否可以渲染指定节点
   * @param node 节点实例
   */
  canRender(node: BaseNode): node is T;

  /**
   * 获取节点的边界框（用于碰撞检测等）
   * @param node 节点实例
   */
  getBounds?(node: T): { x: number; y: number; width: number; height: number };

  /**
   * 渲染器优先级（数字越大优先级越高）
   */
  priority?: number;
}

/**
 * 抽象节点渲染器基类
 */
export abstract class BaseNodeRenderer<T extends BaseNode = BaseNode>
  implements INodeRenderer<T>
{
  abstract readonly type: string;
  public priority: number = 0;

  /**
   * 子类必须实现的渲染方法
   */
  abstract render(node: T, context: RenderContext): void;

  /**
   * 默认的类型检查实现
   */
  canRender(node: BaseNode): node is T {
    return node.type === this.type;
  }

  /**
   * 默认的边界框获取实现
   */
  getBounds(node: T): { x: number; y: number; width: number; height: number } {
    return {
      x: node.x,
      y: node.y,
      width: node.w,
      height: node.h,
    };
  }

  /**
   * 辅助方法：保存和恢复Canvas状态
   */
  protected withCanvasState(
    context: RenderContext,
    callback: () => void
  ): void {
    context.ctx.save();
    try {
      callback();
    } finally {
      context.ctx.restore();
    }
  }

  /**
   * 辅助方法：应用节点变换
   */
  protected applyNodeTransform(node: T, context: RenderContext): void {
    const { ctx } = context;

    // 应用位置变换
    ctx.translate(node.x + node.w / 2, node.y + node.h / 2);

    // 应用旋转
    if (node.rotation !== 0) {
      ctx.rotate((node.rotation * Math.PI) / 180);
    }

    // 移回原点
    ctx.translate(-node.w / 2, -node.h / 2);
  }
}
