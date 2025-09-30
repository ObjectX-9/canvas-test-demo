import { RenderContext } from "./RenderElement";

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
 */
export abstract class UIRenderElement {
  protected props: UIRenderProps;
  protected children: UIRenderElement[] = [];
  protected parent: UIRenderElement | null = null;

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
   */
  abstract render(context: RenderContext): void;

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
   */
  renderTree(context: RenderContext): void {
    if (!this.props.visible) return;

    const { ctx } = context;

    // 保存上下文状态
    ctx.save();

    try {
      // 应用透明度
      if (this.props.opacity !== undefined && this.props.opacity < 1) {
        ctx.globalAlpha = this.props.opacity;
      }

      // 渲染自身
      this.render(context);

      // 渲染子元素
      this.children.forEach((child) => {
        child.renderTree(context);
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

  render(context: RenderContext): void {
    const { ctx, canvas } = context;

    console.log("🎨 渲染网格");

    ctx.save();

    try {
      ctx.strokeStyle = this.strokeStyle;
      ctx.lineWidth = this.lineWidth;
      ctx.beginPath();

      // 绘制垂直线
      for (let x = 0; x <= canvas.width; x += this.gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
      }

      // 绘制水平线
      for (let y = 0; y <= canvas.height; y += this.gridSize) {
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

  render(context: RenderContext): void {
    const { ctx, canvas } = context;

    console.log("📏 渲染标尺");

    ctx.save();

    try {
      // 绘制标尺背景
      ctx.fillStyle = this.backgroundColor;

      // 水平标尺
      ctx.fillRect(0, 0, canvas.width, this.rulerSize);

      // 垂直标尺
      ctx.fillRect(0, 0, this.rulerSize, canvas.height);

      // 绘制标尺刻度
      this.drawRulerTicks(ctx, canvas);

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
    canvas: HTMLCanvasElement
  ): void {
    ctx.fillStyle = this.textColor;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const tickInterval = 50; // 主刻度间距
    const minorTickInterval = 10; // 次刻度间距

    // 绘制水平标尺刻度
    for (let x = 0; x <= canvas.width; x += minorTickInterval) {
      const isMajorTick = x % tickInterval === 0;
      const tickHeight = isMajorTick ? 8 : 4;

      ctx.beginPath();
      ctx.moveTo(x, this.rulerSize - tickHeight);
      ctx.lineTo(x, this.rulerSize);
      ctx.strokeStyle = this.textColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // 绘制数字标签
      if (isMajorTick && x > 0) {
        ctx.fillText(x.toString(), x, this.rulerSize / 2);
      }
    }

    // 绘制垂直标尺刻度
    ctx.textAlign = "center";
    for (let y = 0; y <= canvas.height; y += minorTickInterval) {
      const isMajorTick = y % tickInterval === 0;
      const tickWidth = isMajorTick ? 8 : 4;

      ctx.beginPath();
      ctx.moveTo(this.rulerSize - tickWidth, y);
      ctx.lineTo(this.rulerSize, y);
      ctx.strokeStyle = this.textColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // 绘制数字标签（旋转）
      if (isMajorTick && y > 0) {
        ctx.save();
        ctx.translate(this.rulerSize / 2, y);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(y.toString(), 0, 0);
        ctx.restore();
      }
    }
  }
}

/**
 * 背景渲染元素
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

  render(context: RenderContext): void {
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
