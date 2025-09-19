import { RenderEngine } from "../RenderEngine";
import { Page } from "../../nodeTree/node/page";
import { BaseNode } from "../../nodeTree/node/baseNode";
import { Canvas2DGraphics } from "./Canvas2DGraphics";
import {
  CanvasGridRenderer,
  CanvasBackgroundRenderer,
  CanvasRulerRenderer,
} from "./renderers";

/**
 * Canvas 2D 专用渲染引擎
 * 继承通用RenderEngine，添加Canvas 2D特定功能
 */
export class CanvasRenderEngine extends RenderEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private canvasInitialized = false;

  /**
   * 初始化Canvas渲染引擎
   * @param canvas Canvas元素
   */
  initializeCanvas(canvas: HTMLCanvasElement): void {
    if (this.canvasInitialized) {
      console.warn("Canvas渲染引擎已经初始化");
      return;
    }

    // 保存canvas引用
    this.canvas = canvas;

    // 获取2D上下文
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("无法获取Canvas 2D上下文，请检查浏览器兼容性");
    }
    this.ctx = ctx;

    // 初始化通用渲染引擎
    this.initialize();

    // 设置Canvas专用渲染器
    this.setGridRenderer(new CanvasGridRenderer());
    this.setBackgroundRenderer(new CanvasBackgroundRenderer());
    this.setRulerRenderer(new CanvasRulerRenderer());

    this.canvasInitialized = true;
    console.log("✅ Canvas渲染引擎已初始化", {
      canvasSize: `${canvas.width}x${canvas.height}`,
      pixelRatio: window.devicePixelRatio || 1,
    });
  }

  /**
   * 渲染页面 (Canvas 2D版本)
   * @param page 要渲染的页面
   * @param options 渲染选项
   */
  renderCanvasPage(
    page: Page,
    options: {
      renderRulers?: boolean;
      renderGrid?: boolean;
      rulerRenderer?: (
        ctx: CanvasRenderingContext2D,
        canvas: HTMLCanvasElement
      ) => void;
    } = {}
  ): void {
    if (!this.canvasInitialized || !this.ctx || !this.canvas) {
      throw new Error(
        "Canvas渲染引擎未初始化，请先调用 initializeCanvas(canvas) 方法"
      );
    }

    // 创建Canvas 2D图形API适配器
    const graphics = new Canvas2DGraphics(this.ctx, this.canvas);

    // 使用通用渲染引擎的renderPage
    this.renderPage(page, graphics, options);
  }

  /**
   * 渲染单个节点 (Canvas 2D版本)
   * @param node 要渲染的节点
   */
  renderCanvasNode(node: BaseNode): boolean {
    if (!this.canvasInitialized || !this.ctx || !this.canvas) {
      throw new Error(
        "Canvas渲染引擎未初始化，请先调用 initializeCanvas(canvas) 方法"
      );
    }

    // 创建Canvas 2D图形API适配器
    const graphics = new Canvas2DGraphics(this.ctx, this.canvas);

    // 使用通用渲染引擎的renderNode
    return this.renderNode(node, graphics);
  }

  /**
   * 获取Canvas元素
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * 获取Canvas 2D上下文
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.ctx;
  }

  /**
   * 获取Canvas尺寸
   */
  getCanvasSize(): { width: number; height: number } | null {
    if (!this.canvas) return null;
    return {
      width: this.canvas.width,
      height: this.canvas.height,
    };
  }

  /**
   * 调整Canvas尺寸
   * @param width 宽度
   * @param height 高度
   * @param devicePixelRatio 设备像素比（可选）
   */
  resizeCanvas(width: number, height: number, devicePixelRatio?: number): void {
    if (!this.canvas || !this.ctx) {
      throw new Error("Canvas渲染引擎未初始化");
    }

    const ratio = devicePixelRatio || window.devicePixelRatio || 1;

    // 设置CSS尺寸
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    // 设置实际尺寸
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;

    // 缩放上下文以匹配设备像素比
    this.ctx.scale(ratio, ratio);

    console.log(`Canvas尺寸已调整: ${width}x${height} (设备像素比: ${ratio})`);
  }

  /**
   * 清除Canvas
   */
  clearCanvas(): void {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 销毁Canvas渲染引擎
   */
  destroyCanvas(): void {
    this.canvas = null;
    this.ctx = null;
    this.canvasInitialized = false;

    // 通用渲染引擎没有destroy方法，这里不需要调用

    console.log("Canvas渲染引擎已销毁");
  }

  /**
   * 切换标尺显示
   */
  toggleRuler(visible: boolean): void {
    if (this.rulerRenderer && "toggle" in this.rulerRenderer) {
      (this.rulerRenderer as CanvasRulerRenderer).toggle(visible);
    }
  }

  /**
   * 设置标尺主题
   */
  setRulerTheme(theme: "light" | "dark"): void {
    if (this.rulerRenderer && "setTheme" in this.rulerRenderer) {
      (this.rulerRenderer as CanvasRulerRenderer).setTheme(theme);
    }
  }
}
