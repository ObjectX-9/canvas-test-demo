import { BaseState } from "./nodes/baseState";
import { mat3 } from "gl-matrix";

/**
 * 视图类型 - 使用矩阵表示视图变换
 * 矩阵格式：[scaleX, skewY, translateX, skewX, scaleY, translateY, 0, 0, 1]
 */
export type ViewMatrix = {
  /** 视图变换矩阵 */
  matrix: mat3;
};

/**
 * 视图状态工具函数
 */
export class ViewUtils {
  /**
   * 创建默认视图矩阵（无变换）
   */
  static createIdentity(): ViewMatrix {
    return {
      matrix: mat3.create(),
    };
  }

  /**
   * 创建带有平移和缩放的视图矩阵
   */
  static create(
    pageX: number = 0,
    pageY: number = 0,
    scale: number = 1
  ): ViewMatrix {
    const matrix = mat3.create();
    mat3.translate(matrix, matrix, [pageX, pageY]);
    mat3.scale(matrix, matrix, [scale, scale]);
    return { matrix };
  }

  /**
   * 从视图矩阵中提取平移值
   */
  static getTranslation(view: ViewMatrix): { pageX: number; pageY: number } {
    return {
      pageX: view.matrix[6],
      pageY: view.matrix[7],
    };
  }

  /**
   * 从视图矩阵中提取缩放值
   */
  static getScale(view: ViewMatrix): number {
    // 取X轴缩放值（假设X和Y缩放相同）
    return Math.sqrt(
      view.matrix[0] * view.matrix[0] + view.matrix[1] * view.matrix[1]
    );
  }

  /**
   * 更新视图的平移
   */
  static updateTranslation(
    view: ViewMatrix,
    deltaX: number,
    deltaY: number
  ): ViewMatrix {
    const newMatrix = mat3.clone(view.matrix);
    mat3.translate(newMatrix, newMatrix, [deltaX, deltaY]);
    return { matrix: newMatrix };
  }

  /**
   * 更新视图的缩放
   */
  static updateScale(
    view: ViewMatrix,
    scale: number,
    centerX?: number,
    centerY?: number
  ): ViewMatrix {
    const currentScale = ViewUtils.getScale(view);
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
  static reset(): ViewMatrix {
    return ViewUtils.createIdentity();
  }

  /**
   * 复制视图
   */
  static clone(view: ViewMatrix): ViewMatrix {
    return {
      matrix: mat3.clone(view.matrix),
    };
  }
}

export type Transform = {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
};
export type ArrayTransform = [
  [number, number, number],
  [number, number, number]
];
export type XYWH = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ElementCollections = {
  [key: string]: BaseState;
};
