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
  private renderedChildren = new Set<string>();

  protected onRender(
    _context: RenderContext,
    _viewTransform?: ViewTransform
  ): void {
    // 获取当前页面的所有子元素
    const currentPage = pageManager.getCurrentPage();
    if (!currentPage) return;

    const currentChildren = new Set(currentPage.children);

    // 添加新的子元素
    currentChildren.forEach((childId) => {
      if (!this.renderedChildren.has(childId)) {
        const child = nodeTree.getNodeById(childId);
        const skiaDom = child?.skiaDom;
        if (skiaDom) {
          this.appendChild(skiaDom);
          this.renderedChildren.add(childId);
          console.log(`🟢 页面添加子元素: ${childId}`);
        }
      }
    });

    // 移除不再存在的子元素
    this.renderedChildren.forEach((childId) => {
      if (!currentChildren.has(childId)) {
        const child = nodeTree.getNodeById(childId);
        const skiaDom = child?.skiaDom;
        if (skiaDom) {
          this.removeChild(skiaDom);
          this.renderedChildren.delete(childId);
          console.log(`🟢 页面移除子元素: ${childId}`);
        }
      }
    });
  }
}
