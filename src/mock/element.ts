import { RectangleState } from "../core/types/nodes/rectangle";

// 矩形元素模拟数据 - ID与页面children字段匹配
export const mockRectangleData: RectangleState[] = [
  {
    id: "rect_001",
    type: "rectangle",
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
    fill: "#2196F3",
    x: 400,
    y: 200,
    w: 150,
    h: 150,
    radius: 16,
    rotation: 15,
  },
  {
    id: "rect_003",
    type: "rectangle",
    fill: "#FF9800",
    x: 200,
    y: 150,
    w: 250,
    h: 120,
    radius: 12,
    rotation: -10,
  },
];

// 兼容旧版本的数据格式（保留备用）
export const mockElementData = {
  "1": {
    id: "1",
    type: "rectangle",
    fill: "#ffee00",
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

// 获取矩形数据的辅助函数
export function getMockRectangleById(id: string): RectangleState | undefined {
  return mockRectangleData.find((rect) => rect.id === id);
}

// 获取所有矩形数据
export function getAllMockRectangles(): RectangleState[] {
  return mockRectangleData;
}

// 旧版本的初始化函数（已废弃，使用PageManager.initializeMockPages代替）
