import { mat3 } from "gl-matrix";
import { ViewType, Transform, XYWH } from "../types";
import { viewStore } from "../store/ViewStore";
import { uniformScale, IUniformScale } from "../utils/uniformScale";

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
  getViewState(): ViewType {
    return viewStore.getView();
  }

  /**
   * 设置视图状态
   */
  setViewState(view: ViewType): void {
    viewStore.setView(view);
  }

  /**
   * 更新视图位置
   */
  updateViewPosition(deltaX: number, deltaY: number): void {
    const currentView = this.getViewState();
    this.setViewState({
      ...currentView,
      pageX: currentView.pageX + deltaX,
      pageY: currentView.pageY + deltaY,
    });
  }

  /**
   * 更新视图缩放
   */
  updateViewScale(scale: number, centerX?: number, centerY?: number): void {
    const currentView = this.getViewState();

    if (centerX !== undefined && centerY !== undefined) {
      // 以指定点为中心缩放
      const scaleRatio = scale / currentView.scale;
      const newPageX = centerX - (centerX - currentView.pageX) * scaleRatio;
      const newPageY = centerY - (centerY - currentView.pageY) * scaleRatio;

      this.setViewState({
        pageX: newPageX,
        pageY: newPageY,
        scale: scale,
      });
    } else {
      // 简单缩放
      this.setViewState({
        ...currentView,
        scale: scale,
      });
    }
  }

  /**
   * 屏幕坐标转换为世界坐标
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const view = this.getViewState();
    return {
      x: (screenX - view.pageX) / view.scale,
      y: (screenY - view.pageY) / view.scale,
    };
  }

  /**
   * 世界坐标转换为屏幕坐标
   */
  worldToScreen(worldX: number, worldY: number): { x: number; y: number } {
    const view = this.getViewState();
    return {
      x: worldX * view.scale + view.pageX,
      y: worldY * view.scale + view.pageY,
    };
  }

  /**
   * 创建视图变换矩阵
   */
  getViewTransformMatrix(): mat3 {
    const view = this.getViewState();
    const matrix = mat3.create();

    // 先平移，再缩放
    mat3.translate(matrix, matrix, [view.pageX, view.pageY]);
    mat3.scale(matrix, matrix, [view.scale, view.scale]);

    return matrix;
  }

  /**
   * 创建从Transform对象到mat3矩阵的转换
   */
  transformToMatrix(transform: Transform): mat3 {
    return mat3.fromValues(
      transform.m00,
      transform.m01,
      transform.m02,
      transform.m10,
      transform.m11,
      transform.m12,
      0,
      0,
      1
    );
  }

  /**
   * 创建从mat3矩阵到Transform对象的转换
   */
  matrixToTransform(matrix: mat3): Transform {
    return {
      m00: matrix[0],
      m01: matrix[1],
      m02: matrix[2],
      m10: matrix[3],
      m11: matrix[4],
      m12: matrix[5],
    };
  }

  /**
   * 执行等比缩放变换
   */
  performUniformScale(options: IUniformScale): mat3 {
    return uniformScale(options);
  }

  /**
   * 计算包围盒
   */
  calculateBoundingBox(elements: XYWH[]): XYWH {
    if (elements.length === 0) {
      return { x: 0, y: 0, w: 0, h: 0 };
    }

    let minX = elements[0].x;
    let minY = elements[0].y;
    let maxX = elements[0].x + elements[0].w;
    let maxY = elements[0].y + elements[0].h;

    for (const element of elements) {
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.w);
      maxY = Math.max(maxY, element.y + element.h);
    }

    return {
      x: minX,
      y: minY,
      w: maxX - minX,
      h: maxY - minY,
    };
  }

  /**
   * 检查点是否在矩形内
   */
  isPointInRect(pointX: number, pointY: number, rect: XYWH): boolean {
    return (
      pointX >= rect.x &&
      pointX <= rect.x + rect.w &&
      pointY >= rect.y &&
      pointY <= rect.y + rect.h
    );
  }

  /**
   * 计算两点之间的距离
   */
  getDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * 重置视图到初始状态
   */
  resetView(): void {
    this.setViewState({
      pageX: 0,
      pageY: 0,
      scale: 1,
    });
  }

  /**
   * 让视图适应指定的矩形区域
   */
  fitToRect(
    rect: XYWH,
    containerWidth: number,
    containerHeight: number,
    padding = 50
  ): void {
    const scaleX = (containerWidth - padding * 2) / rect.w;
    const scaleY = (containerHeight - padding * 2) / rect.h;
    const scale = Math.min(scaleX, scaleY);

    const centerX = rect.x + rect.w / 2;
    const centerY = rect.y + rect.h / 2;

    this.setViewState({
      pageX: containerWidth / 2 - centerX * scale,
      pageY: containerHeight / 2 - centerY * scale,
      scale: scale,
    });
  }
}

// 导出单例实例
export const coordinateSystemManager = CoordinateSystemManager.getInstance();
