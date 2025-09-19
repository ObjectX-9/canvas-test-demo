import { pageManager } from "../core/manage";

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

// 将mock元素添加到对应页面
export const initializeMockData = () => {
  const pages = pageManager.getAllPages();

  if (pages.length > 0) {
    // 将前两个矩形添加到第一个页面
    pages[0].addChild("1");
    pages[0].addChild("2");
  }

  // 创建第二个页面并添加第三个矩形
  if (pages.length === 1) {
    const page2 = pageManager.createPage({
      name: "页面 2",
      backgroundColor: "#f0f0f0",
    });
    page2.addChild("3");
  }
};
