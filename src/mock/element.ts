import { RectangleState } from "../core/types/nodes/rectangleState";

// 矩形元素模拟数据 - ID与页面children字段匹配
export const mockRectangleData: RectangleState[] = [
  {
    id: "rect_001",
    type: "rectangle",
    name: "矩形1",
    fill: "#4CAF50",
    x: 150,
    y: 120,
    w: 200,
    h: 100,
    radius: 8,
    rotation: 0,
  },
  {
    id: "rect_002",
    type: "rectangle",
    name: "矩形2",
    fill: "#2196F3",
    x: 400,
    y: 200,
    w: 150,
    h: 150,
    radius: 16,
    rotation: 15,
  },
];

// 兼容旧版本的数据格式（保留备用）
export const mockElementData = {
  "1": {
    id: "1",
    type: "rectangle",
    fill: "#ffee00",
    name: "矩形1",
    x: 100,
    y: 100,
    w: 100,
    h: 100,
    radius: 0,
    rotation: 0,
  },
  "2": {
    id: "2",
    type: "rectangle",
    fill: "#ffaa00",
    x: 200,
    name: "矩形2",
    y: 200,
    w: 100,
    h: 100,
    radius: 0,
    rotation: 0,
  },
  "3": {
    id: "3",
    type: "rectangle",
    fill: "#ff00aa",
    name: "矩形3",
    x: 100,
    y: 200,
    w: 100,
    h: 100,
    radius: 0,
    rotation: 0,
  },
};

export function getBasicElement(): typeof mockElementData {
  return mockElementData;
}
