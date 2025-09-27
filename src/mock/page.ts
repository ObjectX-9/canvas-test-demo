import { PageState } from "../core/types/nodes/pageState";

// 示例页面数据
export const mockPageData: Record<string, PageState> = {
  page_001: {
    id: "page_001",
    type: "page",
    name: "首页设计",
    backgroundColor: "#f5f5f5",
    width: 1920,
    height: 1080,
    children: ["1", "2", "3"],
    isActive: true,
    zoom: 1,
    panX: 0,
    panY: 0,
    fill: "#f5f5f5",
    x: 0,
    y: 0,
    w: 1920,
    h: 1080,
    rotation: 0,
  },
};

export function getBasicPage(): Record<string, PageState> {
  return mockPageData;
}
