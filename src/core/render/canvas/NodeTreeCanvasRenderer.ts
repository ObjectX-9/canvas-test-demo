import { PageNode } from "../../nodeTree/node/pageNode";
import { nodeTree } from "../../nodeTree";
import { viewManager } from "../../manage/ViewManager";
import { ViewInfo } from "../../types/view";
import {
  RenderElement,
  RenderContext,
  ContainerRenderElement,
} from "./RenderElement";
import { UIRenderElement } from "./UIRenderElement";

/**
 * Canvas节点树渲染器
 * 类似 Skia 的 JsRenderer，管理整个渲染流程
 * 支持节点树内容层 + UI辅助层的分层渲染
 */
export class NodeTreeCanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private pixelRatio: number;

  // 内容层（节点树数据）
  private contentRenderRoot: RenderElement | null = null;

  // UI辅助层（网格、标尺等）
  private uiRenderRoot: UIRenderElement | null = null;

  private animationId: number | null = null;
  private isRenderRequested = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.pixelRatio = window.devicePixelRatio || 1;

    if (!this.ctx) {
      throw new Error("无法获取Canvas 2D上下文");
    }

    // 初始化UI根容器
    this.uiRenderRoot = new ContainerUIElement();

    console.log("🚀 NodeTreeCanvasRenderer 初始化完成", {
      width: canvas.width,
      height: canvas.height,
      pixelRatio: this.pixelRatio,
    });
  }

  /**
   * 设置Canvas尺寸，考虑设备像素比
   */
  setCanvasSize(width: number, height: number): void {
    // 设置Canvas实际尺寸
    this.canvas.width = width * this.pixelRatio;
    this.canvas.height = height * this.pixelRatio;

    // 设置CSS尺寸
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    // 缩放上下文以适应设备像素比
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    console.log("📐 Canvas尺寸已设置", {
      width,
      height,
      pixelRatio: this.pixelRatio,
    });
  }

  /**
   * 根据页面构建内容渲染树
   */
  private buildContentRenderTree(pageNode: PageNode): RenderElement {
    console.log(`🌳 构建内容渲染树: ${pageNode.name}`);

    // 创建根容器
    const rootContainer = new ContainerRenderElement(pageNode);

    // 获取页面的renderDom作为背景
    const pageRenderElement = pageNode.renderDom;
    if (pageRenderElement) {
      rootContainer.appendChild(pageRenderElement);
    }

    // 遍历页面的子节点，构建渲染树
    const children = pageNode.children || [];
    children.forEach((childId) => {
      const childNode = nodeTree.getNodeById(childId);
      if (childNode) {
        const childRenderElement = childNode.renderDom;
        if (childRenderElement) {
          console.log(`📦 添加子渲染元素: ${childId} (${childNode.type})`);
          rootContainer.appendChild(childRenderElement);
        } else {
          console.warn(`⚠️ 无法创建子渲染元素: ${childId}`);
        }
      } else {
        console.warn(`⚠️ 找不到子节点: ${childId}`);
      }
    });

    return rootContainer;
  }

  /**
   * 添加UI元素到UI层
   */
  addUIElement(element: UIRenderElement): void {
    if (this.uiRenderRoot) {
      this.uiRenderRoot.appendChild(element);
      console.log("➕ 添加UI元素到UI层");
    }
  }

  /**
   * 移除UI元素
   */
  removeUIElement(element: UIRenderElement): void {
    if (this.uiRenderRoot) {
      this.uiRenderRoot.removeChild(element);
      console.log("➖ 从UI层移除UI元素");
    }
  }

  /**
   * 清空所有UI元素
   */
  clearUIElements(): void {
    if (this.uiRenderRoot) {
      this.uiRenderRoot = new ContainerUIElement();
      console.log("🗑️ 清空所有UI元素");
    }
  }

  /**
   * 渲染页面（内容层）
   */
  renderPage(pageNode: PageNode, viewState?: ViewInfo): void {
    try {
      console.log(`🎨 开始渲染页面: ${pageNode.name}`);

      // 构建内容渲染树（只在需要时重建）
      if (!this.contentRenderRoot) {
        this.contentRenderRoot = this.buildContentRenderTree(pageNode);
      }

      // 请求渲染
      this.requestRender(viewState);
    } catch (error) {
      console.error("❌ 页面渲染失败:", error);
    }
  }

  /**
   * 请求渲染（防抖）
   */
  private requestRender(viewState?: ViewInfo): void {
    if (this.isRenderRequested) {
      return;
    }

    this.isRenderRequested = true;

    // 使用 requestAnimationFrame 进行渲染调度
    this.animationId = requestAnimationFrame(() => {
      this.performRender(viewState);
      this.isRenderRequested = false;
    });
  }

  /**
   * 执行实际渲染 - 分层渲染架构
   */
  private performRender(viewState?: ViewInfo): void {
    console.log("🎨 执行分层渲染循环");

    // 清空画布
    this.clearCanvas();

    // 创建渲染上下文
    const renderContext: RenderContext = {
      canvas: this.canvas,
      ctx: this.ctx,
      pixelRatio: this.pixelRatio,
      viewTransform: viewState
        ? this.createViewTransform(viewState)
        : undefined,
    };

    try {
      // === 第一层：UI背景层（不受视图变换影响） ===
      this.renderUIBackground(renderContext);

      // === 第二层：内容层（受视图变换影响） ===
      if (this.contentRenderRoot) {
        this.ctx.save();
        this.applyViewTransform(viewState);
        this.contentRenderRoot.renderTree(renderContext);
        this.ctx.restore();
      }

      // === 第三层：UI前景层（不受视图变换影响） ===
      this.renderUIForeground(renderContext);

      console.log("✅ 分层渲染循环完成");
    } catch (error) {
      console.error("❌ 渲染失败:", error);
    }
  }

  /**
   * 渲染UI背景层（网格等）
   */
  private renderUIBackground(context: RenderContext): void {
    if (!this.uiRenderRoot) return;

    // 渲染zIndex < 0的UI元素（背景层）
    this.uiRenderRoot
      .getChildren()
      .filter((child) => (child.getProps().zIndex || 0) < 0)
      .forEach((child) => {
        child.renderTree(context);
      });
  }

  /**
   * 渲染UI前景层（标尺、工具等）
   */
  private renderUIForeground(context: RenderContext): void {
    if (!this.uiRenderRoot) return;

    // 渲染zIndex >= 0的UI元素（前景层）
    this.uiRenderRoot
      .getChildren()
      .filter((child) => (child.getProps().zIndex || 0) >= 0)
      .forEach((child) => {
        child.renderTree(context);
      });
  }

  /**
   * 清空画布
   */
  private clearCanvas(): void {
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  /**
   * 应用视图变换（只影响内容层）
   */
  private applyViewTransform(viewState?: ViewInfo): void {
    if (viewState) {
      const scale = viewManager.getScale(viewState);
      const translation = viewManager.getTranslation(viewState);

      // 应用缩放和平移
      this.ctx.translate(translation.pageX, translation.pageY);
      this.ctx.scale(scale, scale);

      console.log(
        `🔄 应用视图变换: 缩放=${scale.toFixed(
          2
        )}, 平移=(${translation.pageX.toFixed(0)}, ${translation.pageY.toFixed(
          0
        )})`
      );
    }
  }

  /**
   * 创建视图变换矩阵
   */
  private createViewTransform(viewState: ViewInfo): DOMMatrix {
    const scale = viewManager.getScale(viewState);
    const translation = viewManager.getTranslation(viewState);

    const matrix = new DOMMatrix();
    matrix.translateSelf(translation.pageX, translation.pageY);
    matrix.scaleSelf(scale, scale);

    return matrix;
  }

  /**
   * 重建内容渲染树（当数据变化时）
   */
  rebuildContentRenderTree(pageNode: PageNode): void {
    console.log("🔄 重建内容渲染树");
    this.contentRenderRoot = this.buildContentRenderTree(pageNode);
  }

  /**
   * 清空渲染内容
   */
  clear(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.clearCanvas();
    this.contentRenderRoot = null;
    this.uiRenderRoot = new ContainerUIElement();
    this.isRenderRequested = false;

    console.log("🗑️ 渲染器已清空");
  }

  /**
   * 获取Canvas元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 获取渲染上下文
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * 获取设备像素比
   */
  getPixelRatio(): number {
    return this.pixelRatio;
  }

  /**
   * 获取UI根元素（用于添加UI组件）
   */
  getUIRoot(): UIRenderElement | null {
    return this.uiRenderRoot;
  }
}

/**
 * UI容器元素
 */
class ContainerUIElement extends UIRenderElement {
  render(_context: RenderContext): void {
    // 容器不需要渲染内容，只管理子元素
  }
}
