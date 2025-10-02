// 数据格式
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
    radius: 10,
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
    radius: 20,
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
