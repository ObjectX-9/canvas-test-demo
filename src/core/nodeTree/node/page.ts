import { PageState } from "../../types/nodes/page";
import { BaseNode } from "./baseNode";

export class Page extends BaseNode {
  _state: PageState;

  constructor(state: PageState) {
    super(state);
    this._state = state;
  }

  get type() {
    return "page";
  }

  get name() {
    return this._state.name ?? "未命名页面";
  }

  set name(name: string) {
    this._state.name = name;
  }

  get backgroundColor() {
    return this._state.backgroundColor ?? "#ffffff";
  }

  set backgroundColor(color: string) {
    this._state.backgroundColor = color;
  }

  get width() {
    return this._state.width ?? 1920;
  }

  set width(width: number) {
    this._state.width = width;
  }

  get height() {
    return this._state.height ?? 1080;
  }

  set height(height: number) {
    this._state.height = height;
  }

  get children() {
    return this._state.children ?? [];
  }

  set children(children: string[]) {
    this._state.children = children;
  }

  get isActive() {
    return this._state.isActive ?? false;
  }

  set isActive(active: boolean) {
    this._state.isActive = active;
  }

  get zoom() {
    return this._state.zoom ?? 1;
  }

  set zoom(zoom: number) {
    this._state.zoom = Math.max(0.1, Math.min(10, zoom)); // 限制缩放范围
  }

  get panX() {
    return this._state.panX ?? 0;
  }

  set panX(x: number) {
    this._state.panX = x;
  }

  get panY() {
    return this._state.panY ?? 0;
  }

  set panY(y: number) {
    this._state.panY = y;
  }

  // 添加子节点
  addChild(nodeId: string) {
    // 确保 children 数组存在
    if (!this._state.children) {
      this._state.children = [];
    }
    if (!this._state.children.includes(nodeId)) {
      this._state.children.push(nodeId);
    }
  }

  // 移除子节点
  removeChild(nodeId: string) {
    this._state.children = this.children.filter((id) => id !== nodeId);
  }

  // 清空所有子节点
  clearChildren() {
    this._state.children = [];
  }

  // 重置视图状态
  resetView() {
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
  }
}
