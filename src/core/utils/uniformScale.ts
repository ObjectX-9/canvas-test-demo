import { mat3, vec2 } from 'gl-matrix';

export type DirectKey =
  | 'LT' // 左上
  | 'RT' // 右上
  | 'RB' // 右下
  | 'LB' // 左下
  | 'TC' // 上
  | 'BC' // 下
  | 'LC' // 左
  | 'RC' // 右
  | 'CC' // 中

export interface IUniformScale {
  maxPos?: {
    x: number,
    y: number,
    w: number,
    h: number,
  }
  transform?: mat3;
  // 缩放中心
  scaleCenter?: DirectKey;
  // 缩放比率
  ratio?: number;
}

export const uniformScale = (options: IUniformScale = {}) => {
  const { maxPos = { x: 0, y: 0, w: 100, h: 100 }, transform = mat3.fromTranslation(mat3.create(), [0, 0]), scaleCenter = 'CC', ratio = 1 } = options;
  // 1. 获取最大包围盒的位置信息
  // 2. 计算缩放中心
  const ap0 = vec2.fromValues(0, 0);
  const ap1 = vec2.fromValues(maxPos.w, 0);
  const ap2 = vec2.fromValues(maxPos.w, maxPos.h);
  const ap3 = vec2.fromValues(0, maxPos.h);

  vec2.transformMat3(ap0, ap0, transform);
  vec2.transformMat3(ap1, ap1, transform);
  vec2.transformMat3(ap2, ap2, transform);
  vec2.transformMat3(ap3, ap3, transform);

  const apivot = vec2.create();
  switch (scaleCenter) {
    case 'LT': vec2.copy(apivot, ap0); break;
    case 'RT': vec2.copy(apivot, ap1); break;
    case 'RB': vec2.copy(apivot, ap2); break;
    case 'LB': vec2.copy(apivot, ap3); break;
    // 计算中点
    case 'TC':
      vec2.add(apivot, ap0, ap1);
      vec2.scale(apivot, apivot, 0.5);
      break;
    case 'RC':
      vec2.add(apivot, ap1, ap2);
      vec2.scale(apivot, apivot, 0.5);
      break;
    case 'BC':
      vec2.add(apivot, ap2, ap3);
      vec2.scale(apivot, apivot, 0.5);
      break;
    case 'LC':
      vec2.add(apivot, ap3, ap0);
      vec2.scale(apivot, apivot, 0.5);
      break;
    case 'CC':
      vec2.add(apivot, ap0, ap2);
      vec2.scale(apivot, apivot, 0.5);
      break;
  }

  // 3. 平移矩阵，将图形平移到apivot
  const toPivotMat = mat3.fromTranslation(mat3.create(), apivot);
  // 4. 缩放矩阵，将图形根据缩放比率缩放
  const scaleMat = mat3.fromScaling(mat3.create(), [ratio, ratio]);
  // 5. 平移矩阵，将矩阵平移到原点
  const fromPivotMat = mat3.invert(mat3.create(), toPivotMat);

  // 组合等比缩放矩阵
  const newTransMat = mat3.create();
  mat3.mul(newTransMat, fromPivotMat, newTransMat); // 平移到原点位置
  mat3.mul(newTransMat, scaleMat, newTransMat); // 缩放
  mat3.mul(newTransMat, toPivotMat, newTransMat); // 平移到原位置
  return newTransMat;
};
