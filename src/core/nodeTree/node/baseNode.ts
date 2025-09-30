import { BaseState } from "../../types/nodes/baseState";
import {
  RenderElement,
  RenderElementFactory,
} from "../../render/canvas/RenderElement";

export class BaseNode {
  _state: BaseState;
  private _renderDom: RenderElement | null = null;

  constructor(state: BaseState) {
    this._state = state;
  }

  /**
   * 懒加载渲染桥梁 - 类似 Skia 的 skiaDom
   * 第一次访问时创建对应的 RenderElement，之后返回缓存的实例
   */
  get renderDom(): RenderElement | null {
    if (!this._renderDom) {
      console.log(`🔗 创建渲染桥梁: ${this.type} (${this.id})`);
      this._renderDom = RenderElementFactory.create(this);
    }
    return this._renderDom;
  }

  /**
   * 清除渲染缓存 - 当节点属性变化时调用
   */
  invalidateRenderDom(): void {
    console.log(`🔄 清除渲染缓存: ${this.type} (${this.id})`);
    this._renderDom = null;
  }

  get id() {
    return this._state.id ?? "1";
  }

  get fill() {
    return this._state.fill ?? "#eeffaa";
  }

  set fill(fill: string) {
    this._state.fill = fill;
    this.invalidateRenderDom(); // 属性变化时清除渲染缓存
  }

  get name() {
    return this._state.name ?? "base";
  }

  set name(name: string) {
    this._state.name = name;
  }

  get type() {
    return this._state.type ?? "base";
  }

  get x() {
    return this._state.x ?? 0;
  }

  set x(x: number) {
    this._state.x = x;
    this.invalidateRenderDom(); // 位置变化时清除渲染缓存
  }

  get y() {
    return this._state.y ?? 0;
  }

  set y(y: number) {
    this._state.y = y;
    this.invalidateRenderDom(); // 位置变化时清除渲染缓存
  }

  get w() {
    return this._state.w ?? 0;
  }

  set w(w: number) {
    this._state.w = w;
    this.invalidateRenderDom(); // 尺寸变化时清除渲染缓存
  }

  get h() {
    return this._state.h ?? 0;
  }

  set h(h: number) {
    this._state.h = h;
    this.invalidateRenderDom(); // 尺寸变化时清除渲染缓存
  }

  get rotation() {
    return this._state.rotation ?? 0;
  }

  changeFills() {
    this.fill = "#eeddss";
  }
}
