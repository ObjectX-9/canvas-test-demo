import { mat3 } from "gl-matrix";
import { RectangleState } from "../types/nodes/rectangle";

interface IDrawRect {
  transform?: mat3;
  state?: RectangleState;
}
export const drawRect = (
  canvas: CanvasRenderingContext2D,
  options: IDrawRect = {}
) => {
  // 默认矩阵
  const defaultMat = mat3.fromTranslation(mat3.create(), [0, 0]);
  const { transform = defaultMat, state } = options;
  const { x = 0, y = 0, w = 100, h = 100, fill } = state as RectangleState;
  // 绘制矩形在逻辑坐标 (200, 200) 位置
  canvas.save(); // 保存状态，以便后续重置变换矩阵

  // 计算新矩阵
  const newMat = mat3.mul(mat3.create(), transform, defaultMat);

  // // 应用矩阵变换
  canvas.transform(
    newMat[0], // a
    newMat[1], // b
    newMat[3], // c
    newMat[4], // d
    newMat[6], // e (平移 x 轴)
    newMat[7] // f (平移 y 轴)
  );

  // 绘制矩形
  canvas.strokeStyle = "#ffee00";
  canvas.fillStyle = fill;
  canvas.lineWidth = 2 / newMat[0];
  canvas.fillRect(x, y, w, h);
  // 重置变换矩阵
  canvas.restore(); // 恢复保存的状态
};
