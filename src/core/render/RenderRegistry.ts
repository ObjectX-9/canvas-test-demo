import { BaseNode } from "../nodeTree/node/baseNode";
import { INodeRenderer, RenderContext } from "./NodeRenderer";

/**
 * 渲染器注册中心
 * 负责管理所有节点类型的渲染器
 */
export class RenderRegistry {
  private renderers: Map<string, INodeRenderer> = new Map();
  private defaultRenderer?: INodeRenderer;

  /**
   * 注册节点渲染器
   * @param renderer 渲染器实例
   */
  register(renderer: INodeRenderer): void {
    if (this.renderers.has(renderer.type)) {
      console.warn(`渲染器类型 ${renderer.type} 已存在，将被覆盖`);
    }
    this.renderers.set(renderer.type, renderer);
  }

  /**
   * 批量注册渲染器
   * @param renderers 渲染器数组
   */
  registerAll(renderers: INodeRenderer[]): void {
    renderers.forEach((renderer) => this.register(renderer));
  }

  /**
   * 注销渲染器
   * @param type 节点类型
   */
  unregister(type: string): boolean {
    return this.renderers.delete(type);
  }

  /**
   * 设置默认渲染器（当找不到对应类型渲染器时使用）
   * @param renderer 默认渲染器
   */
  setDefaultRenderer(renderer: INodeRenderer): void {
    this.defaultRenderer = renderer;
  }

  /**
   * 获取指定类型的渲染器
   * @param type 节点类型
   * @returns 渲染器实例或undefined
   */
  getRenderer(type: string): INodeRenderer | undefined {
    return this.renderers.get(type);
  }

  /**
   * 根据节点查找合适的渲染器
   * @param node 节点实例
   * @returns 渲染器实例或undefined
   */
  findRenderer(node: BaseNode): INodeRenderer | undefined {
    // 首先尝试根据节点类型查找
    const typeRenderer = this.renderers.get(node.type);
    if (typeRenderer?.canRender(node)) {
      return typeRenderer;
    }

    // 遍历所有渲染器，找到第一个可以渲染该节点的
    const sortedRenderers = Array.from(this.renderers.values()).sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );

    for (const renderer of sortedRenderers) {
      if (renderer.canRender(node)) {
        return renderer;
      }
    }

    // 使用默认渲染器
    if (this.defaultRenderer?.canRender(node)) {
      return this.defaultRenderer;
    }

    return undefined;
  }

  /**
   * 渲染节点
   * @param node 要渲染的节点
   * @param context 渲染上下文
   * @returns 是否成功渲染
   */
  renderNode(node: BaseNode, context: RenderContext): boolean {
    const renderer = this.findRenderer(node);

    if (!renderer) {
      console.warn(`未找到节点类型 ${node.type} 的渲染器`);
      return false;
    }

    try {
      renderer.render(node, context);
      return true;
    } catch (error) {
      console.error(`渲染节点 ${node.id} 时出错:`, error);
      return false;
    }
  }

  /**
   * 批量渲染节点
   * @param nodes 节点数组
   * @param context 渲染上下文
   * @returns 成功渲染的节点数量
   */
  renderNodes(nodes: BaseNode[], context: RenderContext): number {
    let successCount = 0;

    for (const node of nodes) {
      if (this.renderNode(node, context)) {
        successCount++;
      }
    }

    return successCount;
  }

  /**
   * 获取所有已注册的渲染器类型
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.renderers.keys());
  }

  /**
   * 检查是否已注册指定类型的渲染器
   * @param type 节点类型
   */
  hasRenderer(type: string): boolean {
    return this.renderers.has(type);
  }

  /**
   * 获取渲染器统计信息
   */
  getStats(): {
    totalRenderers: number;
    registeredTypes: string[];
    hasDefaultRenderer: boolean;
  } {
    return {
      totalRenderers: this.renderers.size,
      registeredTypes: this.getRegisteredTypes(),
      hasDefaultRenderer: !!this.defaultRenderer,
    };
  }

  /**
   * 清空所有渲染器
   */
  clear(): void {
    this.renderers.clear();
    this.defaultRenderer = undefined;
  }
}

// 导出全局渲染器注册中心实例
export const globalRenderRegistry = new RenderRegistry();
