import { RenderContext, ViewTransform } from "../types";
import { BaseCanvasElementProps } from "../../canvasReconciler/CanvasElementFactory";

/**
 * Canvas元素基类
 * 简化版本，直接使用Canvas进行渲染
 * @template T - 元素类型字符串
 * @template P - 元素属性类型
 */
export abstract class CanvasElement<
  T extends string = string,
  P extends BaseCanvasElementProps = BaseCanvasElementProps
> {
  abstract readonly type: T;
  protected props: P;
  public children: CanvasElement[] = [];
  protected parent: CanvasElement | null = null;
  protected canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, props: P) {
    this.canvas = canvas;
    this.props = props;
  }

  /**
   * 渲染方法 - 子类必须实现
   */
  protected abstract onRender(
    context: RenderContext,
    viewTransform?: ViewTransform
  ): void;

  /**
   * 添加子元素
   */
  appendChild(child: CanvasElement): void {
    // 避免重复添加
    if (!this.children.includes(child) && child.parent !== this) {
      // 如果子元素已经有父元素，先从原父元素移除
      if (child.parent) {
        child.parent.removeChild(child);
      }
      child.parent = this;
      this.children.push(child);
    }
  }

  /**
   * 移除子元素
   */
  removeChild(child: CanvasElement): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  /**
   * 渲染自身和子元素
   */
  render(context: RenderContext, viewTransform?: ViewTransform): void {
    // 渲染自身
    this.onRender(context, viewTransform);

    // 渲染子元素
    this.children.forEach((child) => {
      child.render(context, viewTransform);
    });
  }

  /**
   * 更新属性
   */
  updateProps(newProps: Partial<P>): void {
    this.props = { ...this.props, ...newProps };
  }

  /**
   * 获取属性
   */
  getProps(): P {
    return this.props;
  }

  /**
   * 获取Canvas元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 清理资源
   */
  protected onDelete(): void {
    // 子类可以重写此方法进行清理
  }

  /**
   * 销毁元素
   */
  destroy(): void {
    this.onDelete();
    this.children.forEach((child) => child.destroy());
    this.children = [];
    this.parent = null;
  }
}
