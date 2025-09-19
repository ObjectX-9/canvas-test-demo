import { BaseNode } from "../nodeTree/node/baseNode";
import { Page } from "../nodeTree/node/page";
import { nodeTree } from "../nodeTree";
import { coordinateSystemManager } from "../manage";
import { RenderRegistry, globalRenderRegistry } from "./RenderRegistry";
import { RenderContext, INodeRenderer } from "./NodeRenderer";
import { createBuiltinRenderers, createDefaultRenderer } from "./renderers";

/**
 * 渲染引擎
 * 负责整合页面渲染逻辑和节点渲染器系统
 */
export class RenderEngine {
  private registry: RenderRegistry;
  private initialized: boolean = false;

  constructor(registry?: RenderRegistry) {
    this.registry = registry || globalRenderRegistry;
  }

  /**
   * 初始化渲染引擎
   */
  initialize(): void {
    if (this.initialized) {
      return;
    }

    // 注册内置渲染器
    const builtinRenderers = createBuiltinRenderers();
    this.registry.registerAll(builtinRenderers);

    // 设置默认渲染器
    const defaultRenderer = createDefaultRenderer();
    this.registry.setDefaultRenderer(defaultRenderer);

    this.initialized = true;
    console.log("渲染引擎已初始化", this.registry.getStats());
  }

  /**
   * 渲染完整页面
   * @param page 要渲染的页面
   * @param ctx Canvas渲染上下文
   * @param canvas Canvas元素
   * @param options 渲染选项
   */
  renderPage(
    page: Page,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    options: {
      renderRulers?: boolean;
      renderGrid?: boolean;
      rulerRenderer?: (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
      ) => void;
    } = {}
  ): void {
    if (!this.initialized) {
      this.initialize();
    }

    const { renderRulers = false, renderGrid = true, rulerRenderer } = options;

    console.log(
      "🎨 开始渲染页面:",
      page.name,
      "子节点数量:",
      page.children.length
    );

    // 1. 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 2. 绘制页面背景色
    ctx.fillStyle = page.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3. 绘制标尺（在坐标变换之前）
    if (renderRulers && rulerRenderer) {
      rulerRenderer(ctx, canvas);
    }

    // 4. 保存状态并应用坐标变换
    ctx.save();
    const viewMatrix = coordinateSystemManager.getViewTransformMatrix();

    ctx.setTransform(
      viewMatrix[0],
      viewMatrix[1],
      viewMatrix[3],
      viewMatrix[4],
      viewMatrix[6],
      viewMatrix[7]
    );

    // 5. 绘制网格
    if (renderGrid) {
      this.renderGrid(ctx, canvas);
    }

    // 6. 创建渲染上下文
    const context: RenderContext = {
      ctx,
      canvas,
      viewMatrix: coordinateSystemManager.getViewTransformMatrix(),
      scale: coordinateSystemManager.getViewState().scale,
    };

    // 7. 渲染页面子节点
    const childNodes = this.getPageChildNodes(page);
    const renderedCount = this.registry.renderNodes(childNodes, context);

    if (renderedCount < childNodes.length) {
      console.warn(
        `页面 ${page.name} 中有 ${
          childNodes.length - renderedCount
        } 个节点未能渲染`
      );
    }

    // 8. 恢复坐标变换
    ctx.restore();
  }

  /**
   * 渲染单个节点
   * @param node 要渲染的节点
   * @param ctx Canvas渲染上下文
   * @param canvas Canvas元素
   */
  renderNode(
    node: BaseNode,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    const context: RenderContext = {
      ctx,
      canvas,
      viewMatrix: coordinateSystemManager.getViewTransformMatrix(),
      scale: coordinateSystemManager.getViewState().scale,
    };

    return this.registry.renderNode(node, context);
  }

  /**
   * 获取页面的子节点实例
   */
  private getPageChildNodes(page: Page): BaseNode[] {
    const nodes: BaseNode[] = [];

    for (const nodeId of page.children) {
      const nodeState = nodeTree.getNodeById(nodeId);
      if (nodeState) {
        // 这里需要根据节点状态创建节点实例
        // 假设我们有一个工厂方法来创建节点实例
        const nodeInstance = this.createNodeFromState(nodeState);
        if (nodeInstance) {
          nodes.push(nodeInstance);
        }
      }
    }
    return nodes;
  }

  /**
   * 根据节点状态创建节点实例
   */
  private createNodeFromState(nodeState: unknown): BaseNode | null {
    try {
      return nodeState as BaseNode;
    } catch (error) {
      console.error("创建节点实例失败:", error);
      return null;
    }
  }

  /**
   * 获取渲染器注册中心
   */
  getRegistry(): RenderRegistry {
    return this.registry;
  }

  /**
   * 添加自定义渲染器
   * @param renderer 渲染器实例
   */
  addRenderer(renderer: INodeRenderer): void {
    this.registry.register(renderer);
  }

  /**
   * 检查是否支持指定节点类型
   * @param nodeType 节点类型
   */
  supportsNodeType(nodeType: string): boolean {
    return this.registry.hasRenderer(nodeType);
  }

  /**
   * 获取支持的节点类型列表
   */
  getSupportedNodeTypes(): string[] {
    return this.registry.getRegisteredTypes();
  }

  /**
   * 渲染网格
   * @param ctx Canvas渲染上下文
   * @param canvas Canvas元素
   */
  private renderGrid(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void {
    const currentView = coordinateSystemManager.getViewState();
    const step = 25;

    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1 / currentView.scale;

    const viewportWidth = canvas.width / currentView.scale;
    const viewportHeight = canvas.height / currentView.scale;

    const startX =
      Math.floor(-currentView.pageX / currentView.scale / step) * step;
    const startY =
      Math.floor(-currentView.pageY / currentView.scale / step) * step;
    const endX = startX + viewportWidth + step;
    const endY = startY + viewportHeight + step;

    // 绘制垂直线
    for (let x = startX; x <= endX; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    // 绘制水平线
    for (let y = startY; y <= endY; y += step) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  }
}

// 导出全局渲染引擎实例
export const globalRenderEngine = new RenderEngine();
