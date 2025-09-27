import { mat3 } from "gl-matrix";
import { ViewInfo } from "../types";

export class ViewManager {
  private viewInfo: ViewInfo;

  constructor() {
    this.viewInfo = this.createIdentity();
  }

  getViewInfo() {
    return this.viewInfo;
  }

  setViewInfo(viewInfo: ViewInfo) {
    this.viewInfo = viewInfo;
  }

  /**
   * 创建默认视图矩阵（无变换）
   */
  createIdentity(): ViewInfo {
    return {
      matrix: mat3.create(),
    };
  }

  /**
   * 创建带有平移和缩放的视图矩阵
   */
  create(pageX: number = 0, pageY: number = 0, scale: number = 1): ViewInfo {
    const matrix = mat3.create();
    mat3.translate(matrix, matrix, [pageX, pageY]);
    mat3.scale(matrix, matrix, [scale, scale]);
    return { matrix };
  }

  /**
   * 从视图矩阵中提取平移值
   */
  getTranslation(view: ViewInfo): { pageX: number; pageY: number } {
    return {
      pageX: view.matrix[6],
      pageY: view.matrix[7],
    };
  }

  /**
   * 从视图矩阵中提取缩放值
   */
  getScale(view: ViewInfo): number {
    // 取X轴缩放值（假设X和Y缩放相同）
    return Math.sqrt(
      view.matrix[0] * view.matrix[0] + view.matrix[1] * view.matrix[1]
    );
  }

  /**
   * 更新视图的平移
   */
  updateTranslation(view: ViewInfo, deltaX: number, deltaY: number): ViewInfo {
    const newMatrix = mat3.clone(view.matrix);
    mat3.translate(newMatrix, newMatrix, [deltaX, deltaY]);
    return { matrix: newMatrix };
  }

  /**
   * 更新视图的缩放
   */
  updateScale(
    view: ViewInfo,
    scale: number,
    centerX?: number,
    centerY?: number
  ): ViewInfo {
    const currentScale = this.getScale(view);
    const scaleRatio = scale / currentScale;

    const newMatrix = mat3.clone(view.matrix);

    if (centerX !== undefined && centerY !== undefined) {
      // 以指定点为中心缩放
      const centerMatrix = mat3.fromTranslation(mat3.create(), [
        centerX,
        centerY,
      ]);
      const invCenterMatrix = mat3.invert(mat3.create(), centerMatrix);
      const scaleMatrix = mat3.fromScaling(mat3.create(), [
        scaleRatio,
        scaleRatio,
      ]);

      mat3.multiply(newMatrix, invCenterMatrix, newMatrix);
      mat3.multiply(newMatrix, scaleMatrix, newMatrix);
      mat3.multiply(newMatrix, centerMatrix, newMatrix);
    } else {
      // 简单缩放
      mat3.scale(newMatrix, newMatrix, [scaleRatio, scaleRatio]);
    }

    return { matrix: newMatrix };
  }

  /**
   * 重置视图到初始状态
   */
  reset(): ViewInfo {
    return this.createIdentity();
  }
}

export const viewManager: ViewManager = new ViewManager();
