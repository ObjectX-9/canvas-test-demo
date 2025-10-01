import { createCanvasElement, getMainCanvasElement } from "@/core/render";
import { CanvasElement } from "@/core/render/canvasElement/Element/CanvasBaseElement";
import {
  CanvasElementType,
  getCkTypeByType,
} from "@/core/render/canvasReconciler/CanvasElementFactory";
import { BaseNode } from "./baseNode";
import { BaseState } from "@/core/types";

export class SkiaNode extends BaseNode {
  protected _skiaDom?: CanvasElement;

  constructor(state: BaseState) {
    super(state);
  }

  get canvas() {
    return getMainCanvasElement();
  }

  /**
   * 获取对应的渲染元素（懒加载）
   * 类似 JsElement 的 skiaDom getter
   */
  get skiaDom(): CanvasElement | undefined {
    if (!this._skiaDom) {
      this._skiaDom = this.createSkiaDom();
    }
    return this._skiaDom;
  }

  get skiaType(): CanvasElementType {
    return getCkTypeByType(this.type);
  }

  /**
   * 创建渲染元素 - 子类需要实现
   * 类似 JsElement 的 createSkiaDom
   */
  protected createSkiaDom(): CanvasElement | undefined {
    // 子类实现
    return createCanvasElement(
      this.skiaType,
      this.canvas,
      this.getSkiaDomProps()
    );
  }

  /**
   * 获取传递给 CanvasElement 的 props
   * 关键：将 this (节点实例) 作为 jsNode 传递
   */
  protected getSkiaDomProps(): Record<string, unknown> {
    return {
      jsNode: this, // ✨ 核心：传递节点引用
    };
  }

  /**
   * 清除 skiaDom 缓存
   */
  clearSkiaDom(): void {
    this._skiaDom = undefined;
  }
}
