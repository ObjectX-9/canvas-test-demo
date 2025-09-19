import { BaseState } from "./baseState";

export interface PageState extends BaseState {
  // page特有属性
  name: string; // page名称
  backgroundColor: string; // 背景颜色
  width: number; // 画布宽度
  height: number; // 画布高度
  children: string[]; // 子节点ID列表
  isActive: boolean; // 是否为当前活动页面
  zoom: number; // 缩放级别
  panX: number; // 水平偏移
  panY: number; // 垂直偏移
}
