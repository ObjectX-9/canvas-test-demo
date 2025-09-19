import { CanvasRenderEngine } from "./CanvasRenderEngine";
import { Rectangle } from "../../nodeTree/node/rectangle";

/**
 * Canvas渲染器 - 向后兼容的API
 * 封装Canvas特定的渲染逻辑
 */
export class CanvasRenderer {
  private engine: CanvasRenderEngine;
  private initialized = false;

  constructor() {
    this.engine = new CanvasRenderEngine();
  }

  /**
   * 初始化渲染器
   * @param container Canvas元素
   */
  init(container: HTMLCanvasElement): void {
    if (this.initialized) {
      console.warn("Canvas渲染器已经初始化");
      return;
    }

    try {
      this.engine.initializeCanvas(container);
      this.initialized = true;
      console.log("Canvas渲染器初始化成功");
    } catch (error) {
      console.error("Canvas渲染器初始化失败:", error);
      throw error;
    }
  }

  /**
   * 渲染场景
   * @param ctx Canvas上下文 (兼容参数，实际会使用内部上下文)
   * @param scale 缩放比例
   * @param offset 偏移量
   */
  render(
    _ctx: CanvasRenderingContext2D | null,
    scale: number,
    offset: { x: number; y: number }
  ): void {
    if (!this.initialized) {
      console.warn("渲染器未初始化");
      return;
    }

    // 这里可以根据scale和offset进行相应的变换
    console.log("🎨 Canvas渲染场景", { scale, offset });
  }

  /**
   * 清除画布
   */
  clear(): void {
    if (!this.initialized) {
      console.warn("渲染器未初始化");
      return;
    }

    this.engine.clearCanvas();
  }

  /**
   * 绘制矩形
   * @param node 矩形节点
   */
  drawRectangle(node: Rectangle): void {
    if (!this.initialized || !node) {
      console.warn("无法绘制矩形：渲染器未初始化或节点不存在");
      return;
    }

    this.engine.renderCanvasNode(node);
  }

  /**
   * 获取Canvas上下文
   */
  getContext(): CanvasRenderingContext2D | null {
    return this.engine.getContext();
  }

  /**
   * 获取Canvas元素
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.engine.getCanvas();
  }

  /**
   * 获取Canvas尺寸
   */
  getCanvasSize(): { width: number; height: number } | null {
    return this.engine.getCanvasSize();
  }

  /**
   * 调整Canvas尺寸
   */
  resizeCanvas(width: number, height: number, devicePixelRatio?: number): void {
    if (!this.initialized) {
      throw new Error("渲染器未初始化");
    }
    this.engine.resizeCanvas(width, height, devicePixelRatio);
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    if (this.engine) {
      this.engine.destroyCanvas();
    }
    this.initialized = false;
    console.log("Canvas渲染器已销毁");
  }
}
