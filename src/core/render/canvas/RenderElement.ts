import { BaseNode } from "../../nodeTree/node/baseNode";
import { Rectangle } from "../../nodeTree/node/rectangle";
import { PageNode } from "../../nodeTree/node/pageNode";

/**
 * 渲染上下文接口
 */
export interface RenderContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  pixelRatio: number;
  viewTransform?: DOMMatrix;
}

/**
 * 渲染元素基类
 * 类似 Skia 的 CkElement，专注于渲染逻辑
 */
export abstract class RenderElement {
  protected node: BaseNode;
  protected children: RenderElement[] = [];
  protected parent: RenderElement | null = null;

  constructor(node: BaseNode) {
    this.node = node;
  }

  /**
   * 渲染方法 - 子类必须实现
   */
  abstract render(context: RenderContext): void;

  /**
   * 添加子渲染元素
   */
  appendChild(child: RenderElement): void {
    child.parent = this;
    this.children.push(child);
  }

  /**
   * 移除子渲染元素
   */
  removeChild(child: RenderElement): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  /**
   * 渲染自身和所有子元素
   */
  renderTree(context: RenderContext): void {
    // 先渲染自身
    this.render(context);

    // 再渲染子元素
    this.children.forEach((child) => {
      child.renderTree(context);
    });
  }

  /**
   * 获取节点数据
   */
  getNode(): BaseNode {
    return this.node;
  }

  /**
   * 获取边界框
   */
  getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.node.x,
      y: this.node.y,
      width: this.node.w,
      height: this.node.h,
    };
  }
}

/**
 * 矩形渲染元素
 */
export class RectRenderElement extends RenderElement {
  constructor(node: Rectangle) {
    super(node);
  }

  render(context: RenderContext): void {
    const { ctx } = context;
    const rectNode = this.node as Rectangle;

    console.log(`🎨 渲染矩形: ${rectNode.id}`, {
      x: rectNode.x,
      y: rectNode.y,
      w: rectNode.w,
      h: rectNode.h,
      fill: rectNode.fill,
    });

    ctx.save();

    try {
      // 设置填充颜色
      if (rectNode.fill) {
        ctx.fillStyle = rectNode.fill;
      }

      // 绘制矩形
      if (rectNode.radius > 0) {
        // 圆角矩形
        this.drawRoundedRect(
          ctx,
          rectNode.x,
          rectNode.y,
          rectNode.w,
          rectNode.h,
          rectNode.radius
        );
        ctx.fill();
      } else {
        // 普通矩形
        ctx.fillRect(rectNode.x, rectNode.y, rectNode.w, rectNode.h);
      }

      // 绘制边框
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      if (rectNode.radius > 0) {
        this.drawRoundedRect(
          ctx,
          rectNode.x,
          rectNode.y,
          rectNode.w,
          rectNode.h,
          rectNode.radius
        );
        ctx.stroke();
      } else {
        ctx.strokeRect(rectNode.x, rectNode.y, rectNode.w, rectNode.h);
      }
    } catch (error) {
      console.error(`❌ 矩形渲染失败: ${rectNode.id}`, error);
    } finally {
      ctx.restore();
    }
  }

  /**
   * 绘制圆角矩形路径
   */
  private drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

/**
 * 页面渲染元素
 */
export class PageRenderElement extends RenderElement {
  constructor(node: PageNode) {
    super(node);
  }

  render(context: RenderContext): void {
    const { ctx } = context;
    const pageNode = this.node as PageNode;

    console.log(`🎨 渲染页面背景: ${pageNode.id}`, {
      width: pageNode.width,
      height: pageNode.height,
      backgroundColor: pageNode.backgroundColor,
    });

    ctx.save();

    try {
      // 绘制页面背景
      ctx.fillStyle = pageNode.backgroundColor;
      ctx.fillRect(0, 0, pageNode.width, pageNode.height);
    } catch (error) {
      console.error(`❌ 页面背景渲染失败: ${pageNode.id}`, error);
    } finally {
      ctx.restore();
    }
  }
}

/**
 * 容器渲染元素（用于分组和变换）
 */
export class ContainerRenderElement extends RenderElement {
  render(_context: RenderContext): void {
    // 容器本身不渲染内容，只管理子元素
    // 可以在这里添加变换、裁剪等逻辑
  }
}

/**
 * 渲染元素工厂
 * 根据节点类型创建对应的渲染元素
 */
export class RenderElementFactory {
  static create(node: BaseNode): RenderElement | null {
    switch (node.type) {
      case "rectangle":
        return new RectRenderElement(node as Rectangle);
      case "page":
        return new PageRenderElement(node as PageNode);
      case "pencil":
        // TODO: 实现铅笔工具渲染元素
        console.log("📝 铅笔工具渲染元素暂未实现");
        return null;
      default:
        console.warn(`⚠️ 未知的节点类型: ${node.type}`);
        return null;
    }
  }
}
