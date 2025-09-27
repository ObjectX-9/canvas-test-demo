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

// 导出节点类型定义
export * from "./nodes/baseState";
export * from "./nodes/pageState";
export * from "./nodes/rectangleState";
export * from "./nodes/pencilState";
export * from "./nodes/fileState";

// ============其他类型信息============

// 画布视图信息
export * from "./view";
