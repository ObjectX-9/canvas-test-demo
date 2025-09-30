import { IRenderer, RenderNode, ViewState } from "../interfaces/IRenderer";

/**
 * Canvas2D渲染器
 * 将虚拟节点渲染到Canvas 2D上下文
 */
export class Canvas2DRenderer implements IRenderer {
  readonly type = "canvas2d";
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("无法获取Canvas 2D渲染上下文");
    }
    this.ctx = ctx;
  }

  createElement(type: string, props: Record<string, unknown>): RenderNode {
    return {
      type,
      props: { ...props },
      children: [],
    };
  }

  appendChild(parent: RenderNode, child: RenderNode): void {
    parent.children.push(child);
  }

  removeChild(parent: RenderNode, child: RenderNode): void {
    const index = parent.children.indexOf(child);
    if (index !== -1) {
      parent.children.splice(index, 1);
    }
  }

  insertBefore(
    parent: RenderNode,
    child: RenderNode,
    beforeChild: RenderNode
  ): void {
    const index = parent.children.indexOf(beforeChild);
    if (index !== -1) {
      parent.children.splice(index, 0, child);
    } else {
      this.appendChild(parent, child);
    }
  }

  updateElement(
    instance: RenderNode,
    oldProps: Record<string, unknown>,
    newProps: Record<string, unknown>
  ): void {
    Object.assign(instance.props, newProps);
  }

  renderRoot(root: RenderNode, viewState?: ViewState): void {
    const ctx = this.ctx;
    const { width, height } = this.getSize();

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 应用视图变换
    ctx.save();
    if (viewState) {
      this.applyViewState(ctx, viewState);
    }

    // 递归渲染所有子节点
    this.renderNode(ctx, root);

    ctx.restore();
  }

  clear(): void {
    const { width, height } = this.getSize();
    this.ctx.clearRect(0, 0, width, height);
  }

  getSize(): { width: number; height: number } {
    return {
      width: this.ctx.canvas.width,
      height: this.ctx.canvas.height,
    };
  }

  /**
   * 应用视图状态变换
   */
  private applyViewState(
    ctx: CanvasRenderingContext2D,
    viewState: ViewState
  ): void {
    if (viewState.transform && viewState.transform.length >= 6) {
      const [a, b, c, d, e, f] = viewState.transform;
      ctx.setTransform(a, b, c, d, e, f);
    } else {
      // 应用简单的缩放和平移
      if (viewState.translation) {
        ctx.translate(viewState.translation.x, viewState.translation.y);
      }
      if (viewState.scale) {
        ctx.scale(viewState.scale, viewState.scale);
      }
    }
  }

  /**
   * 递归渲染节点
   */
  private renderNode(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    ctx.save();

    // 根据节点类型进行渲染
    switch (node.type) {
      case "rect":
      case "rectangle":
        this.renderRectangle(ctx, node);
        break;
      case "circle":
        this.renderCircle(ctx, node);
        break;
      case "ellipse":
        this.renderEllipse(ctx, node);
        break;
      case "line":
        this.renderLine(ctx, node);
        break;
      case "path":
        this.renderPath(ctx, node);
        break;
      case "text":
        this.renderText(ctx, node);
        break;
      case "image":
        this.renderImage(ctx, node);
        break;
      case "group":
      case "container":
      default:
        // 容器类型，只渲染子节点
        break;
    }

    // 递归渲染所有子节点
    for (const child of node.children) {
      this.renderNode(ctx, child);
    }

    ctx.restore();
  }

  /**
   * 渲染矩形
   */
  private renderRectangle(
    ctx: CanvasRenderingContext2D,
    node: RenderNode
  ): void {
    const {
      x = 0,
      y = 0,
      width = 100,
      height = 100,
      fill,
      stroke,
      strokeWidth = 1,
    } = node.props;

    if (fill) {
      ctx.fillStyle = fill as string;
      ctx.fillRect(x as number, y as number, width as number, height as number);
    }

    if (stroke) {
      ctx.strokeStyle = stroke as string;
      ctx.lineWidth = strokeWidth as number;
      ctx.strokeRect(
        x as number,
        y as number,
        width as number,
        height as number
      );
    }
  }

  /**
   * 渲染圆形
   */
  private renderCircle(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    const {
      x = 0,
      y = 0,
      r = 50,
      radius,
      fill,
      stroke,
      strokeWidth = 1,
    } = node.props;
    const actualRadius = (radius as number) || (r as number);

    ctx.beginPath();
    ctx.arc(x as number, y as number, actualRadius, 0, Math.PI * 2);

    if (fill) {
      ctx.fillStyle = fill as string;
      ctx.fill();
    }

    if (stroke) {
      ctx.strokeStyle = stroke as string;
      ctx.lineWidth = strokeWidth as number;
      ctx.stroke();
    }
  }

  /**
   * 渲染椭圆
   */
  private renderEllipse(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    const {
      x = 0,
      y = 0,
      rx = 50,
      ry = 30,
      fill,
      stroke,
      strokeWidth = 1,
    } = node.props;

    ctx.beginPath();
    ctx.ellipse(
      x as number,
      y as number,
      rx as number,
      ry as number,
      0,
      0,
      Math.PI * 2
    );

    if (fill) {
      ctx.fillStyle = fill as string;
      ctx.fill();
    }

    if (stroke) {
      ctx.strokeStyle = stroke as string;
      ctx.lineWidth = strokeWidth as number;
      ctx.stroke();
    }
  }

  /**
   * 渲染线条
   */
  private renderLine(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    const {
      x1 = 0,
      y1 = 0,
      x2 = 100,
      y2 = 100,
      stroke = "#000",
      strokeWidth = 1,
    } = node.props;

    ctx.beginPath();
    ctx.moveTo(x1 as number, y1 as number);
    ctx.lineTo(x2 as number, y2 as number);
    ctx.strokeStyle = stroke as string;
    ctx.lineWidth = strokeWidth as number;
    ctx.stroke();
  }

  /**
   * 渲染路径
   */
  private renderPath(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    const { d, fill, stroke, strokeWidth = 1 } = node.props;

    if (typeof d === "string") {
      // 简单的路径解析（实际项目中需要完整的SVG路径解析器）
      const path = new Path2D(d);

      if (fill) {
        ctx.fillStyle = fill as string;
        ctx.fill(path);
      }

      if (stroke) {
        ctx.strokeStyle = stroke as string;
        ctx.lineWidth = strokeWidth as number;
        ctx.stroke(path);
      }
    }
  }

  /**
   * 渲染文本
   */
  private renderText(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    const {
      x = 0,
      y = 0,
      text = "",
      children = "",
      fill = "#000",
      fontSize = 16,
      fontFamily = "Arial",
      textAlign = "left",
      textBaseline = "alphabetic",
    } = node.props;

    const textContent = (text as string) || (children as string) || "";

    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = fill as string;
    ctx.textAlign = textAlign as CanvasTextAlign;
    ctx.textBaseline = textBaseline as CanvasTextBaseline;

    ctx.fillText(textContent, x as number, y as number);
  }

  /**
   * 渲染图片
   */
  private renderImage(ctx: CanvasRenderingContext2D, node: RenderNode): void {
    const { x = 0, y = 0, width, height, src } = node.props;

    if (typeof src === "string") {
      const img = new Image();
      img.onload = () => {
        const imgWidth = (width as number) || img.naturalWidth;
        const imgHeight = (height as number) || img.naturalHeight;
        ctx.drawImage(img, x as number, y as number, imgWidth, imgHeight);
      };
      img.src = src;
    }
  }
}
