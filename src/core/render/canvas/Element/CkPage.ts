import { NodeTree } from "@/core/nodeTree";
import { createCanvasElement } from "../..";
import { RenderContext, ViewTransform } from "../types";
import { CanvasElement } from "./CanvasBaseElement";
import { pageManager } from "@/core/manage";

/**
 * Canvas页面元素
 * 模仿Skia的CkPageElement，作为页面的容器元素
 */
export class CkPage extends CanvasElement<"ckpage"> {
  readonly type = "ckpage" as const;

  protected onRender(
    _context: RenderContext,
    _viewTransform?: ViewTransform
  ): void {
    console.log("🎨 CkPage容器渲染");
    // 这里渲染下自己
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 100, 100);
    ctx.restore();

    const currentPage = pageManager.getCurrentPage();
    console.log("✅ ~ currentPage:", currentPage);

    currentPage?.children.forEach((child) => {
      const createElement = createCanvasElement("canvas-rect", this.canvas, {
        x: Math.random() * 100,
        y: Math.random() * 100,
        w: 100,
        h: 100,
        fill: "blue",
      });
      createElement.render(_context, _viewTransform);

      this.appendChild(createElement);
    });

    console.log("✅ ~ this.children:", this.children);
  }
}
