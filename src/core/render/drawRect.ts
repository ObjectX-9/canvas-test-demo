import { mat3 } from "gl-matrix";

interface IDrawRect {
  transform?: mat3;
  w?: number;
  h?: number;
}
export const drawRect = (canvas: CanvasRenderingContext2D, options: IDrawRect = {}) => {
  // 默认矩阵
  const defaultMat = mat3.fromTranslation(mat3.create(), [0, 0]);
  const { transform = defaultMat, w = 100, h = 100, } = options;
  // 绘制矩形在逻辑坐标 (200, 200) 位置
  canvas.save(); // 保存状态，以便后续重置变换矩阵

  // 计算新矩阵
  const newMat = mat3.mul(mat3.create(), transform, defaultMat);
  console.log("✅ ✅ ✅ ~  transform:", transform);

  // 应用矩阵变换
  canvas.transform(
    newMat[0], // a
    newMat[1], // b
    newMat[3], // c
    newMat[4], // d
    newMat[6], // e (平移 x 轴)
    newMat[7]  // f (平移 y 轴)
  );

  // 绘制矩形
  canvas.strokeStyle = "#ff0000";
  canvas.lineWidth = 2 / newMat[0];
  canvas.fillRect(0, 0, w, h);
  // 重置变换矩阵
  canvas.restore(); // 恢复保存的状态
}
