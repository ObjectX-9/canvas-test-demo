import { Rectangle } from "../nodeTree/node/rectangle";
import { RenderEngine } from "../types/render";

export class CanvasRenderer implements RenderEngine {
  private context: CanvasRenderingContext2D | undefined;

  init(container: HTMLCanvasElement): void {
    this.context = container.getContext("2d") as CanvasRenderingContext2D;
    if (!this.context) {
      console.error("Canvas context initialization failed");
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    scale: number,
    offset: { x: number; y: number }
  ): void {
    ctx.save();
    ctx.setTransform(
      scale, // a
      0, // b
      0, // c
      scale, // d
      offset.x, // e (平移 x 轴)
      offset.y // f (平移 y 轴)
    );
    // (this.context as CanvasRenderingContext2D).clearRect(
    //   0,
    //   0,
    //   window.innerWidth,
    //   window.innerHeight
    // );
    // 添加 Canvas 渲染逻辑
  }

  clear(): void {
    (this.context as CanvasRenderingContext2D).clearRect(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );
  }

  destroy(): void {
    if (this.context) {
      this.context.restore();
    }
  }

  drawRectangle(node: Rectangle): void {
    if (!node) {
      console.log("node不存在，无法创建");
      return;
    }
    const { x, y, w, h, fill } = node;
    const ctx = this.context;
    if (ctx) {
      // 默认矩阵
      ctx.save(); // 保存状态，以便后续重置变换矩阵

      // 绘制矩形
      ctx.strokeStyle = "#ffee00";
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
      // 重置变换矩阵
      ctx.restore(); // 恢复保存的状态
      ctx.save(); // 保存状态，以便后续重置变换矩阵
      // 设置字体样式
      ctx.font = "30px Arial"; // 字体大小和字体类型
      ctx.fillStyle = "blue"; // 填充颜色
      ctx.textAlign = "center"; // 文本对齐方式

      // 绘制填充文本
      ctx.fillText(node.id, x, y);
      ctx.restore(); // 恢复保存的状态
    }
  }
}

// 导出渲染循环和数据观察者
export { RenderLoop } from "./RenderLoop";
export { DataObserver, globalDataObserver } from "./DataObserver";
export type { RenderCallback } from "./RenderLoop";
export type { DataChangeCallback } from "./DataObserver";
