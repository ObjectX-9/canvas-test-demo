import React from "react";
import { createReactRenderer } from "./HostConfig";
import {
  IRenderer,
  RenderNode,
  ViewState,
  IReactRenderer,
} from "../interfaces/IRenderer";

/**
 * React渲染器封装类
 * 提供简单易用的React渲染接口
 */
export class ReactRenderer implements IReactRenderer {
  private reconciler: ReturnType<typeof createReactRenderer>;
  private rootContainer: RenderNode;
  private fiberRoot: unknown = null;

  constructor(private renderer: IRenderer) {
    this.reconciler = createReactRenderer(renderer);

    // 创建根容器
    this.rootContainer = renderer.createElement("root", {});
  }

  render(
    element: React.ReactElement,
    container?: RenderNode,
    callback?: () => void
  ): void {
    console.log("🚀 开始React渲染");

    const targetContainer = container || this.rootContainer;

    try {
      // 如果是第一次渲染，创建fiber根
      if (!this.fiberRoot) {
        this.fiberRoot = this.reconciler.createContainer(
          targetContainer,
          0, // tag
          null, // hydrationCallbacks
          false, // isStrictMode
          null, // concurrentUpdatesByDefaultOverride
          "", // identifierPrefix
          () => {}, // onRecoverableError
          null // transitionCallbacks
        );
      }

      // 更新容器
      this.reconciler.updateContainer(
        element,
        this.fiberRoot,
        null, // parentComponent
        () => {
          console.log("✅ React渲染完成");

          // 触发底层渲染器渲染
          this.scheduleRender();

          callback?.();
        }
      );
    } catch (error) {
      console.error("❌ React渲染失败:", error);
      throw error;
    }
  }

  unmount(): void {
    if (this.fiberRoot) {
      this.reconciler.updateContainer(null, this.fiberRoot, null, () => {
        console.log("🗑️ React组件已卸载");
      });
      this.fiberRoot = null;
    }
    this.renderer.clear();
  }

  getRootContainer(): RenderNode {
    return this.rootContainer;
  }

  /**
   * 更新视图状态并重新渲染
   */
  updateViewState(viewState: ViewState): void {
    this.scheduleRender(viewState);
  }

  /**
   * 调度渲染
   */
  private scheduleRender(viewState?: ViewState): void {
    // 使用requestAnimationFrame进行调度，确保在下一帧渲染
    requestAnimationFrame(() => {
      try {
        console.log("🎨 开始底层渲染");
        this.renderer.renderRoot(this.rootContainer, viewState);
        console.log("✅ 底层渲染完成");
      } catch (error) {
        console.error("❌ 底层渲染失败:", error);
      }
    });
  }

  /**
   * 获取底层渲染器
   */
  getRenderer(): IRenderer {
    return this.renderer;
  }

  /**
   * 清空内容
   */
  clear(): void {
    this.renderer.clear();
  }

  /**
   * 获取画布尺寸
   */
  getSize(): { width: number; height: number } {
    return this.renderer.getSize();
  }
}
