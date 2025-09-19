import { BaseNode } from "../nodeTree/node/baseNode";
import { Page } from "../nodeTree/node/page";
import { nodeTree } from "../nodeTree";
import { coordinateSystemManager } from "../manage";
import { RenderRegistry, globalRenderRegistry } from "./RenderRegistry";
import { INodeRenderer } from "./NodeRenderer";
import { createBuiltinRenderers, createDefaultRenderer } from "./renderers";
import { IGraphicsAPI, IRenderContext } from "./interfaces/IGraphicsAPI";
import {
  IGridRenderer,
  IRulerRenderer,
  IBackgroundRenderer,
} from "./interfaces/IRenderer";

/**
 * 抽象渲染引擎
 * 负责整合页面渲染逻辑和节点渲染器系统，不绑定到具体的渲染技术
 */
export class RenderEngine {
  private registry: RenderRegistry;
  private initialized: boolean = false;
  protected gridRenderer?: IGridRenderer;
  protected rulerRenderer?: IRulerRenderer;
  protected backgroundRenderer?: IBackgroundRenderer;

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
   * 渲染完整页面（抽象方法）
   * @param page 要渲染的页面
   * @param graphics 图形API
   * @param options 渲染选项
   */
  renderPage(
    page: Page,
    graphics: IGraphicsAPI,
    options: {
      renderRulers?: boolean;
      renderGrid?: boolean;
    } = {}
  ): void {
    if (!this.initialized) {
      this.initialize();
    }

    const { renderRulers = false, renderGrid = true } = options;

    console.log(
      "🎨 开始渲染页面:",
      page.name,
      "子节点数量:",
      page.children.length
    );

    const canvasSize = graphics.getCanvasSize();
    const viewState = coordinateSystemManager.getViewState();

    // 1. 清空画布
    graphics.clearRect(0, 0, canvasSize.width, canvasSize.height);

    // 2. 绘制页面背景色
    if (this.backgroundRenderer) {
      this.backgroundRenderer.renderBackground(
        graphics,
        canvasSize,
        page.backgroundColor
      );
    } else {
      // 默认背景渲染
      graphics.setFillStyle(page.backgroundColor);
      graphics.fillRect(0, 0, canvasSize.width, canvasSize.height);
    }

    // 3. 标尺将在最后渲染

    // 4. 保存状态并应用坐标变换
    graphics.save();
    const viewMatrix = coordinateSystemManager.getViewTransformMatrix();

    graphics.setTransform(
      viewMatrix[0],
      viewMatrix[1],
      viewMatrix[3],
      viewMatrix[4],
      viewMatrix[6],
      viewMatrix[7]
    );

    // 5. 绘制网格
    if (renderGrid && this.gridRenderer) {
      this.gridRenderer.renderGrid(graphics, canvasSize, viewState);
    }

    // 6. 创建渲染上下文
    const context: IRenderContext = {
      graphics,
      canvasSize,
      viewMatrix: Array.from(coordinateSystemManager.getViewTransformMatrix()),
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
    graphics.restore();

    // 9. 绘制标尺（在最顶层，不受坐标变换影响）
    if (renderRulers && this.rulerRenderer) {
      this.rulerRenderer.renderRulers(graphics, canvasSize, viewState);
    }
  }

  /**
   * 渲染单个节点
   * @param node 要渲染的节点
   * @param graphics 图形API
   */
  renderNode(node: BaseNode, graphics: IGraphicsAPI): boolean {
    if (!this.initialized) {
      this.initialize();
    }

    const context: IRenderContext = {
      graphics,
      canvasSize: graphics.getCanvasSize(),
      viewMatrix: Array.from(coordinateSystemManager.getViewTransformMatrix()),
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
   * 设置网格渲染器
   */
  setGridRenderer(renderer: IGridRenderer): void {
    this.gridRenderer = renderer;
  }

  /**
   * 设置标尺渲染器
   */
  setRulerRenderer(renderer: IRulerRenderer): void {
    this.rulerRenderer = renderer;
  }

  /**
   * 设置背景渲染器
   */
  setBackgroundRenderer(renderer: IBackgroundRenderer): void {
    this.backgroundRenderer = renderer;
  }
}

// 导出全局渲染引擎实例
export const globalRenderEngine = new RenderEngine();
