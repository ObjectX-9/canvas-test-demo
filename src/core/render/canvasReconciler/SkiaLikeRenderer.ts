import React from "react";
import Reconciler from "react-reconciler";
import { createSkiaLikeHostConfig } from "./SkiaLikeHostConfig";
import { CanvasElement } from "../canvasElement/Element/CanvasBaseElement";
import { RenderContext, ViewTransform } from "../canvasElement/types";
import { viewManager, coordinateSystemManager } from "../../manage";
import { RenderApi } from "../renderApi/type";
import logger from "@/core/utils/logerHelper";
import { createCanvasElement } from "./CanvasElementFactory";

/**
 * 简化的Skia风格Canvas渲染器
 * 直接管理Canvas，去除中间抽象层
 */
export class SkiaLikeRenderer {
  private reconciler: ReturnType<typeof Reconciler>;
  private canvas: HTMLCanvasElement;
  private renderApi: RenderApi;
  private pixelRatio: number;
  private rootContainer: CanvasElement;
  private fiberRoot: unknown = null;
  private animationId: number | null = null;
  private isRenderRequested = false;

  constructor(canvas: HTMLCanvasElement, renderApi: RenderApi) {
    this.canvas = canvas;
    this.renderApi = renderApi;
    this.pixelRatio = window.devicePixelRatio || 1;

    if (!this.renderApi) {
      logger.error("无法获取Canvas 2D上下文");
      throw new Error("无法获取Canvas 2D上下文");
    }

    // 创建Host配置
    const hostConfig = createSkiaLikeHostConfig(this);
    this.reconciler = Reconciler(hostConfig);

    // 创建根容器
    this.rootContainer = createCanvasElement("canvas-page", canvas, {});
    console.log("✅ ~ this.rootContainer:", this.rootContainer);
  }

  /**
   * 渲染React元素到Canvas
   */
  render(element: React.ReactElement, callback?: () => void): void {
    try {
      // 如果是第一次渲染，创建fiber根
      if (!this.fiberRoot) {
        this.fiberRoot = this.reconciler.createContainer(
          this.rootContainer,
          0,
          null,
          false,
          null,
          "",
          () => {},
          null
        );
      }
      // 更新容器
      this.reconciler.updateContainer(element, this.fiberRoot, null, () => {
        // 立即触发一次Canvas渲染（用于初次渲染）
        this.performRender();
        callback?.();
      });
    } catch (error) {
      console.error("❌ SkiaLike渲染失败:", error);
      throw error;
    }
  }

  /**
   * 设置Canvas尺寸
   */
  setCanvasSize(width: number, height: number): void {
    this.canvas.width = width * this.pixelRatio;
    this.canvas.height = height * this.pixelRatio;
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";
    this.renderApi.scale(this.pixelRatio);
  }

  /**
   * 请求渲染（供事件系统调用）
   */
  requestRender(): void {
    if (this.isRenderRequested) return;

    this.isRenderRequested = true;
    this.animationId = requestAnimationFrame(() => {
      this.performRender();
      this.isRenderRequested = false;
    });
  }

  /**
   * 执行实际渲染
   */
  performRender(): void {
    // 清空画布
    this.clearCanvas();

    // 获取视图状态
    const viewState = coordinateSystemManager.getViewState();
    const scale = viewManager.getScale(viewState);
    const translation = viewManager.getTranslation(viewState);

    // 创建视图变换
    const viewTransform: ViewTransform = {
      scale,
      offsetX: translation.pageX,
      offsetY: translation.pageY,
    };

    // 创建渲染上下文
    const renderContext: RenderContext = {
      canvas: this.canvas,
      renderApi: this.renderApi,
      pixelRatio: this.pixelRatio,
    };

    // 应用视图变换并渲染所有元素
    this.renderApi.save();
    this.renderApi.translate(translation.pageX, translation.pageY);
    this.renderApi.scale(scale);

    // 渲染根容器（会递归渲染所有子元素）
    this.rootContainer.render(renderContext, viewTransform);

    this.renderApi.restore();
  }

  /**
   * 清空画布
   */
  private clearCanvas(): void {
    this.renderApi.save();
    this.renderApi.setTransform(1, 0, 0, 1, 0, 0);
    this.renderApi.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.renderApi.restore();
  }

  /**
   * 获取Canvas元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 获取根容器
   */
  getRootContainer(): CanvasElement {
    return this.rootContainer;
  }

  /**
   * 清空内容
   */
  clear(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.fiberRoot) {
      this.reconciler.updateContainer(null, this.fiberRoot, null, () => {});
      this.fiberRoot = null;
    }

    this.rootContainer.destroy();
    this.clearCanvas();
  }
}

/**
 * 创建简化的Skia风格渲染器
 */
export function createSkiaLikeRenderer(
  canvas: HTMLCanvasElement,
  renderApi: RenderApi
): SkiaLikeRenderer {
  return new SkiaLikeRenderer(canvas, renderApi);
}
