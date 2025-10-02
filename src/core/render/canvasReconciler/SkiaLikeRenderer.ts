import React from "react";
import Reconciler from "react-reconciler";
import { createSkiaLikeHostConfig } from "./SkiaLikeHostConfig";
import { CanvasElement } from "../canvasElement/Element/CanvasBaseElement";
import {
  RenderContext,
  ViewTransform,
  RenderMode,
} from "../canvasElement/types";
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
    // 注意：不在这里设置 scale，而是在 performRender 中统一处理
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

    // 计算实际画布尺寸（考虑像素比）
    const actualWidth = this.canvas.width / this.pixelRatio;
    const actualHeight = this.canvas.height / this.pixelRatio;

    // 创建完整的视图变换信息
    const viewTransform: ViewTransform = {
      scale,
      offsetX: translation.pageX,
      offsetY: translation.pageY,
    };

    // 创建增强的渲染上下文
    const renderContext: RenderContext = {
      canvas: this.canvas,
      renderApi: this.renderApi,
      pixelRatio: this.pixelRatio,
      actualWidth,
      actualHeight,
      viewTransform,
    };

    // 统一设置像素比缩放和视图变换
    this.renderApi.save();

    // 直接应用组合后的变换矩阵（包含像素比和视图变换）
    this.renderApi.setTransform(
      viewState.matrix[0] * this.pixelRatio, // scaleX * pixelRatio
      viewState.matrix[1] * this.pixelRatio, // skewY * pixelRatio
      viewState.matrix[2] * this.pixelRatio, // skewX * pixelRatio
      viewState.matrix[3] * this.pixelRatio, // scaleY * pixelRatio
      viewState.matrix[4] * this.pixelRatio, // translateX * pixelRatio
      viewState.matrix[5] * this.pixelRatio // translateY * pixelRatio
    );

    // 渲染根容器（会递归渲染所有子元素）
    this.rootContainer.render(renderContext);

    this.renderApi.restore();
  }

  /**
   * 切换渲染模式的辅助方法
   * 供子组件调用，用于在世界坐标和屏幕坐标之间切换
   */
  switchRenderMode(
    renderApi: RenderApi,
    mode: RenderMode,
    pixelRatio: number
  ): void {
    if (mode === RenderMode.SCREEN) {
      // 切换到屏幕坐标模式：重置所有变换，只保留像素比缩放
      renderApi.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    } else {
      // 世界坐标模式：恢复完整的变换矩阵
      const viewState = coordinateSystemManager.getViewState();
      renderApi.setTransform(
        viewState.matrix[0] * pixelRatio,
        viewState.matrix[1] * pixelRatio,
        viewState.matrix[2] * pixelRatio,
        viewState.matrix[3] * pixelRatio,
        viewState.matrix[4] * pixelRatio,
        viewState.matrix[5] * pixelRatio
      );
    }
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
