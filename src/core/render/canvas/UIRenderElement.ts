import { RenderContext } from "./RenderElement";
import { PageNode } from "../../nodeTree/node/pageNode";

/**
 * 视图变换信息接口
 */
export interface ViewTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/**
 * UI渲染元素接口
 * 定义UI辅助元素的基本属性
 */
export interface UIRenderProps {
  visible?: boolean;
  opacity?: number;
  zIndex?: number;
}

/**
 * UI渲染元素基类
 * 用于渲染标尺、网格、选择框等不属于用户设计内容的UI元素
 * 统一支持视图变换，外层计算好变换信息，内部只负责渲染
 */
export abstract class UIRenderElement {
  protected props: UIRenderProps;
  protected children: UIRenderElement[] = [];
  protected parent: UIRenderElement | null = null;
  protected viewTransform?: ViewTransform; // 统一的视图变换信息

  constructor(props: UIRenderProps = {}) {
    this.props = {
      visible: true,
      opacity: 1,
      zIndex: 0,
      ...props,
    };
  }

  /**
   * 渲染方法 - 子类必须实现
   * @param context 渲染上下文
   * @param viewTransform 视图变换信息（由外层计算传入）
   */
  abstract render(context: RenderContext, viewTransform?: ViewTransform): void;

  /**
   * 设置视图变换信息（统一接口）
   */
  setViewTransform(viewTransform: ViewTransform): void {
    this.viewTransform = viewTransform;
  }

  /**
   * 获取视图变换信息
   */
  getViewTransform(): ViewTransform | undefined {
    return this.viewTransform;
  }

  /**
   * 更新属性
   */
  updateProps(newProps: Partial<UIRenderProps>): void {
    this.props = { ...this.props, ...newProps };
  }

  /**
   * 获取属性
   */
  getProps(): UIRenderProps {
    return { ...this.props };
  }

  /**
   * 添加子元素
   */
  appendChild(child: UIRenderElement): void {
    child.parent = this;
    this.children.push(child);
    // 按zIndex排序
    this.children.sort((a, b) => (a.props.zIndex || 0) - (b.props.zIndex || 0));
  }

  /**
   * 移除子元素
   */
  removeChild(child: UIRenderElement): void {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  /**
   * 渲染自身和所有子元素
   * @param context 渲染上下文
   * @param viewTransform 视图变换信息（从外层传递）
   */
  renderTree(context: RenderContext, viewTransform?: ViewTransform): void {
    if (!this.props.visible) return;

    const { ctx } = context;

    // 保存上下文状态
    ctx.save();

    try {
      // 应用透明度
      if (this.props.opacity !== undefined && this.props.opacity < 1) {
        ctx.globalAlpha = this.props.opacity;
      }

      // 如果有传入的视图变换，使用传入的；否则使用自身保存的
      const currentViewTransform = viewTransform || this.viewTransform;

      // 渲染自身
      this.render(context, currentViewTransform);

      // 渲染子元素（传递相同的视图变换）
      this.children.forEach((child) => {
        child.renderTree(context, currentViewTransform);
      });
    } finally {
      // 恢复上下文状态
      ctx.restore();
    }
  }

  /**
   * 设置可见性
   */
  setVisible(visible: boolean): void {
    this.props.visible = visible;
  }

  /**
   * 获取可见性
   */
  isVisible(): boolean {
    return this.props.visible || false;
  }

  /**
   * 获取子元素列表
   */
  getChildren(): UIRenderElement[] {
    return [...this.children];
  }
}

/**
 * 网格渲染元素
 * 支持根据视图变换调整网格显示
 */
export class GridRenderElement extends UIRenderElement {
  private gridSize: number;
  private strokeStyle: string;
  private lineWidth: number;

  constructor(
    props: UIRenderProps & {
      gridSize?: number;
      strokeStyle?: string;
      lineWidth?: number;
    } = {}
  ) {
    super(props);
    this.gridSize = props.gridSize || 20;
    this.strokeStyle = props.strokeStyle || "#e0e0e0";
    this.lineWidth = props.lineWidth || 1;
  }

  render(context: RenderContext, viewTransform?: ViewTransform): void {
    const { ctx, canvas } = context;

    console.log("🎨 渲染动态网格");

    ctx.save();

    try {
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth;

      // 获取视图变换信息
      const scale = viewTransform?.scale || 1;
      const offsetX = viewTransform?.offsetX || 0;
      const offsetY = viewTransform?.offsetY || 0;

      // 根据缩放调整网格大小
      const scaledGridSize = this.gridSize * scale;

      // 如果网格太小或太大，就不绘制
      if (scaledGridSize < 5 || scaledGridSize > 200) {
        return;
      }

      // 计算起始绘制位置，确保网格对齐
      const startX =
        ((offsetX % scaledGridSize) + scaledGridSize) % scaledGridSize;
      const startY =
        ((offsetY % scaledGridSize) + scaledGridSize) % scaledGridSize;

      ctx.beginPath();

      // 绘制垂直线
      for (let x = startX; x <= canvas.width; x += scaledGridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }

      // 绘制水平线
      for (let y = startY; y <= canvas.height; y += scaledGridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
      }

      ctx.stroke();
    } finally {
      ctx.restore();
    }
  }

  /**
   * 更新网格大小
   */
  setGridSize(size: number): void {
    this.gridSize = size;
  }

  /**
   * 更新网格样式
   */
  setStyle(strokeStyle: string, lineWidth: number = 1): void {
    this.strokeStyle = strokeStyle;
    this.lineWidth = lineWidth;
  }
}

/**
 * 标尺渲染元素
 * 根据视图变换动态显示刻度和原点
 */
export class RulerRenderElement extends UIRenderElement {
  private rulerSize: number;
  private backgroundColor: string;
  private textColor: string;
  private strokeStyle: string;

  constructor(
    props: UIRenderProps & {
      rulerSize?: number;
      backgroundColor?: string;
      textColor?: string;
      strokeStyle?: string;
    } = {}
  ) {
    super(props);
    this.rulerSize = props.rulerSize || 20;
    this.backgroundColor = props.backgroundColor || "#f0f0f0";
    this.textColor = props.textColor || "#333";
    this.strokeStyle = props.strokeStyle || "#ccc";
  }

  render(context: RenderContext, viewTransform?: ViewTransform): void {
    const { ctx, canvas } = context;

    console.log("📏 渲染动态标尺");

    ctx.save();

    try {
      // 绘制标尺背景
      ctx.fillStyle = this.backgroundColor;

      // 水平标尺
      ctx.fillRect(0, 0, canvas.width, this.rulerSize);

      // 垂直标尺
      ctx.fillRect(0, 0, this.rulerSize, canvas.height);

      // 绘制标尺刻度（使用传入的视图变换）
      this.drawRulerTicks(ctx, canvas, viewTransform);

      // 绘制标尺边框
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, this.rulerSize);
      ctx.lineTo(canvas.width, this.rulerSize);
      ctx.moveTo(this.rulerSize, 0);
      ctx.lineTo(this.rulerSize, canvas.height);
      ctx.stroke();
    } finally {
      ctx.restore();
    }
  }

  private drawRulerTicks(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    viewTransform?: ViewTransform
  ): void {
    ctx.fillStyle = this.textColor;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 获取视图变换信息
    const scale = viewTransform?.scale || 1;
    const offsetX = viewTransform?.offsetX || 0;
    const offsetY = viewTransform?.offsetY || 0;

    // 根据缩放调整刻度间距
    let tickInterval = 50;
    let minorTickInterval = 10;

    if (scale < 0.5) {
      tickInterval = 100;
      minorTickInterval = 20;
    } else if (scale > 2) {
      tickInterval = 25;
      minorTickInterval = 5;
    }

    // 计算可视区域的世界坐标范围
    const worldStartX = -offsetX / scale;
    const worldEndX = (canvas.width - offsetX) / scale;
    const worldStartY = -offsetY / scale;
    const worldEndY = (canvas.height - offsetY) / scale;

    // 绘制水平标尺刻度
    const startTickX =
      Math.floor(worldStartX / minorTickInterval) * minorTickInterval;
    const endTickX =
      Math.ceil(worldEndX / minorTickInterval) * minorTickInterval;

    for (
      let worldX = startTickX;
      worldX <= endTickX;
      worldX += minorTickInterval
    ) {
      // 转换为屏幕坐标
      const screenX = worldX * scale + offsetX;

      if (screenX >= this.rulerSize && screenX <= canvas.width) {
        const isMajorTick = worldX % tickInterval === 0;
        const tickHeight = isMajorTick ? 8 : 4;

        ctx.beginPath();
        ctx.moveTo(screenX, this.rulerSize - tickHeight);
        ctx.lineTo(screenX, this.rulerSize);
        ctx.strokeStyle = this.textColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 绘制数字标签
        if (isMajorTick && Math.abs(worldX) > 0.1) {
          ctx.fillText(
            Math.round(worldX).toString(),
            screenX,
            this.rulerSize / 2
          );
        }
      }
    }

    // 绘制垂直标尺刻度
    const startTickY =
      Math.floor(worldStartY / minorTickInterval) * minorTickInterval;
    const endTickY =
      Math.ceil(worldEndY / minorTickInterval) * minorTickInterval;

    for (
      let worldY = startTickY;
      worldY <= endTickY;
      worldY += minorTickInterval
    ) {
      // 转换为屏幕坐标
      const screenY = worldY * scale + offsetY;

      if (screenY >= this.rulerSize && screenY <= canvas.height) {
        const isMajorTick = worldY % tickInterval === 0;
        const tickWidth = isMajorTick ? 8 : 4;

        ctx.beginPath();
        ctx.moveTo(this.rulerSize - tickWidth, screenY);
        ctx.lineTo(this.rulerSize, screenY);
        ctx.strokeStyle = this.textColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 绘制数字标签（旋转）
        if (isMajorTick && Math.abs(worldY) > 0.1) {
          ctx.save();
          ctx.translate(this.rulerSize / 2, screenY);
          ctx.rotate(-Math.PI / 2);
          ctx.fillText(Math.round(worldY).toString(), 0, 0);
          ctx.restore();
        }
      }
    }

    // 绘制原点标记
    const originScreenX = 0 * scale + offsetX;
    const originScreenY = 0 * scale + offsetY;

    if (originScreenX >= this.rulerSize && originScreenX <= canvas.width) {
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(originScreenX - 1, 0, 2, this.rulerSize);
    }

    if (originScreenY >= this.rulerSize && originScreenY <= canvas.height) {
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, originScreenY - 1, this.rulerSize, 2);
    }
  }
}

/**
 * 背景渲染元素
 * 通常不受视图变换影响，但保持接口统一
 */
export class BackgroundRenderElement extends UIRenderElement {
  private backgroundColor: string;

  constructor(
    props: UIRenderProps & {
      backgroundColor?: string;
    } = {}
  ) {
    super(props);
    this.backgroundColor = props.backgroundColor || "#ffffff";
  }

  render(context: RenderContext, _viewTransform?: ViewTransform): void {
    const { ctx, canvas } = context;

    console.log("🎨 渲染背景");

    ctx.save();

    try {
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } finally {
      ctx.restore();
    }
  }

  /**
   * 设置背景色
   */
  setBackgroundColor(color: string): void {
    this.backgroundColor = color;
  }
}

/**
 * 页面背景渲染元素
 * 根据当前页面渲染页面背景，层级最低
 */
export class PageBackgroundRenderElement extends UIRenderElement {
  private currentPage: PageNode | null = null; // 当前页面节点

  constructor(
    props: UIRenderProps & {
      currentPage?: PageNode | null;
    } = {}
  ) {
    super(props);
    this.currentPage = props.currentPage || null;
  }

  render(context: RenderContext, viewTransform?: ViewTransform): void {
    if (!this.currentPage) return;

    const { ctx } = context;

    console.log("🎨 渲染页面背景");

    ctx.save();

    try {
      // 获取视图变换信息
      const scale = viewTransform?.scale || 1;
      const offsetX = viewTransform?.offsetX || 0;
      const offsetY = viewTransform?.offsetY || 0;

      // 计算页面在屏幕上的位置和大小
      const pageScreenX = this.currentPage.x * scale + offsetX;
      const pageScreenY = this.currentPage.y * scale + offsetY;
      const pageScreenWidth = this.currentPage.width * scale;
      const pageScreenHeight = this.currentPage.height * scale;

      // 绘制页面背景
      ctx.fillStyle = this.currentPage.backgroundColor;
      ctx.fillRect(pageScreenX, pageScreenY, pageScreenWidth, pageScreenHeight);

      // 可选：绘制页面边框
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        pageScreenX,
        pageScreenY,
        pageScreenWidth,
        pageScreenHeight
      );
    } finally {
      ctx.restore();
    }
  }

  /**
   * 更新当前页面
   */
  setCurrentPage(page: PageNode | null): void {
    this.currentPage = page;
  }

  /**
   * 获取当前页面
   */
  getCurrentPage(): PageNode | null {
    return this.currentPage;
  }
}
