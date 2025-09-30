import { RenderContext, ViewTransform } from "../types";
import { CanvasElementProps } from "../../direct/CanvasElementFactory";

/**
 * Canvas元素基类
 * 简化版本，直接使用Canvas进行渲染
 */
export abstract class CanvasElement<T extends string = string> {
  abstract readonly type: T;
  protected props: CanvasElementProps;
  public children: CanvasElement[] = [];
  protected parent: CanvasElement | null = null;
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, props: CanvasElementProps) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.props = props;

    if (!this.ctx) {
      throw new Error("无法获取Canvas 2D上下文");
    }
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
    child.parent = this;
    this.children.push(child);
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
  updateProps(newProps: Partial<CanvasElementProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  /**
   * 获取属性
   */
  getProps(): CanvasElementProps {
    return this.props;
  }

  /**
   * 获取Canvas元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * 获取Canvas上下文
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx;
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
