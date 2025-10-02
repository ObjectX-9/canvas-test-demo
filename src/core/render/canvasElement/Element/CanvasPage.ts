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

    (jsNode as PageNode)?.children.forEach((_childId) => {
      const child = nodeTree.getNodeById(_childId);
      console.log("✅ ~ child:", child);

      const skiaDom = child?.skiaDom;
      console.log("✅ ~ skiaDom:", skiaDom);

      if (skiaDom) {
        this.appendChild(skiaDom);
      }
    });
  }
}
