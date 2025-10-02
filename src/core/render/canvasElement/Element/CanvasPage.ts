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
  private isInitialized = false;

  protected onRender(
    _context: RenderContext,
    _viewTransform?: ViewTransform
  ): void {
    // 只在第一次渲染时初始化子元素，避免重复添加
    if (!this.isInitialized) {
      const pageSkiaDom = pageManager.getCurrentPage()?.skiaDom;
      const { jsNode } = pageSkiaDom?.getProps() as CanvasPageProps;

      (jsNode as PageNode)?.children.forEach((_childId) => {
        const child = nodeTree.getNodeById(_childId);
        const skiaDom = child?.skiaDom;
        if (skiaDom) {
          this.appendChild(skiaDom);
        }
      });

      this.isInitialized = true;
    }
  }
}
