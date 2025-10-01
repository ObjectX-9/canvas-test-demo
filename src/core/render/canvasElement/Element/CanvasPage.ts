import { createCanvasElement } from "../..";
import { RenderContext, ViewTransform } from "../types";
import { CanvasElement } from "./CanvasBaseElement";
import { pageManager } from "@/core/manage";

/**
 * Canvas页面元素
 * 模仿Skia的CkPageElement，作为页面的容器元素
 */
export class CanvasPage extends CanvasElement<"canvas-page"> {
  readonly type = "canvas-page" as const;

  protected onRender(
    _context: RenderContext,
    _viewTransform?: ViewTransform
  ): void {
    const currentPage = pageManager.getCurrentPage();

    // 这里渲染下自己
    const { renderApi } = _context;
    renderApi.save();
    renderApi.setFillStyle("red");
    renderApi.renderRect({ x: 0, y: 0, width: 100, height: 100 });
    renderApi.restore();

    currentPage?.children.forEach((_child) => {
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
  }
}
