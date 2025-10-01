import { PageNode } from "@/core/nodeTree/node/pageNode";
import { RenderContext, ViewTransform } from "../types";
import { CanvasElement } from "./CanvasBaseElement";
import { nodeTree } from "@/core/nodeTree";
import { pageManager } from "@/core/manage";
import { CanvasPageProps } from "../../canvasReconciler/CanvasElementFactory";

/**
 * Canvas页面元素
 * 模仿Skia的CkPageElement，作为页面的容器元素
 */
export class CanvasPage extends CanvasElement<"canvas-page", CanvasPageProps> {
  readonly type = "canvas-page" as const;

  protected onRender(
    _context: RenderContext,
    _viewTransform?: ViewTransform
  ): void {
    const pageSkiaDom = pageManager.getCurrentPage()?.skiaDom;

    const { jsNode } = pageSkiaDom?.getProps() as CanvasPageProps;

    // 这里渲染下自己
    const { renderApi } = _context;
    renderApi.save();
    renderApi.setFillStyle("red");
    renderApi.renderRect({ x: 0, y: 0, width: 100, height: 100 });
    renderApi.restore();

    (jsNode as PageNode)?.children.forEach((_childId) => {
      const child = nodeTree.getNodeById(_childId);

      const skiaDom = child?.skiaDom;

      if (skiaDom) {
        this.appendChild(skiaDom);
      }
    });
  }
}
