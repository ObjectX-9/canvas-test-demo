import { mat3, vec2 } from "gl-matrix";
import { ViewInfo } from "../types";
import { viewManager } from "./ViewManager";

/**
 * 坐标系统管理器
 * 统一管理视图坐标、变换矩阵、缩放等功能
 */
export class CoordinateSystemManager {
  private static instance: CoordinateSystemManager;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): CoordinateSystemManager {
    if (!CoordinateSystemManager.instance) {
      CoordinateSystemManager.instance = new CoordinateSystemManager();
    }
    return CoordinateSystemManager.instance;
  }

  /**
   * 获取当前视图状态
   */
  getViewState(): ViewInfo {
    return viewManager.getViewInfo();
  }

  /**
   * 设置视图状态
   */
  setViewState(view: ViewInfo): void {
    viewManager.setViewInfo(view);
  }

  /**
   * 更新视图位置
   */
  updateViewPosition(deltaX: number, deltaY: number): void {
    const currentView = this.getViewState();

    const updatedView = viewManager.updateTranslation(
      currentView,
      deltaX,
      deltaY
    );

    this.setViewState(updatedView);
  }

  /**
   * 更新视图缩放
   */
  updateViewScale(scale: number, centerX?: number, centerY?: number): void {
    const currentView = this.getViewState();
    const updatedView = viewManager.updateScale(
      currentView,
      scale,
      centerX,
      centerY
    );
    this.setViewState(updatedView);
  }

  /**
   * 屏幕坐标转换为世界坐标
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const view = this.getViewState();
    // 创建逆变换矩阵
    const inverseMatrix = mat3.invert(mat3.create(), view.matrix);

    // 应用逆变换
    const point = vec2.fromValues(screenX, screenY);
    vec2.transformMat3(point, point, inverseMatrix);

    return {
      x: point[0],
      y: point[1],
    };
  }

  /**
   * 世界坐标转换为屏幕坐标
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const view = this.getViewState();

    // 应用视图变换
    const point = vec2.fromValues(worldX, worldY);
    vec2.transformMat3(point, point, view.matrix);

    return {
      x: point[0],
      y: point[1],
    };
  }

  /**
   * 创建视图变换矩阵（直接返回当前矩阵的副本）
   */
  getViewTransformMatrix(): mat3 {
    const view = this.getViewState();
    return mat3.clone(view.matrix);
  }

  /**
   * 重置视图到初始状态
   */
  resetView(): void {
    this.setViewState(viewManager.reset());
  }
}

// 导出单例实例
export const coordinateSystemManager = CoordinateSystemManager.getInstance();
