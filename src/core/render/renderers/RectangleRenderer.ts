import { BaseNode } from "../../nodeTree/node/baseNode";
import { Rectangle } from "../../nodeTree/node/rectangle";
import { BaseNodeRenderer } from "../NodeRenderer";
import { IRenderContext } from "../interfaces/IGraphicsAPI";
import { selectionStore } from "../../store/SelectionStore";

/**
 * 矩形节点渲染器
 */
export class RectangleRenderer extends BaseNodeRenderer<Rectangle> {
  readonly type = "rectangle";
  priority = 10;

  canRender(node: BaseNode): boolean {
    return node && node.type === "rectangle";
  }

  getSupportedNodeTypes(): string[] {
    return ["rectangle"];
  }

  renderNode(node: Rectangle, context: IRenderContext): boolean {
    const { graphics } = context;
    const isSelected = selectionStore.isNodeSelected(node.id);

    this.withGraphicsState(context, () => {
      // 应用节点变换
      this.applyNodeTransform(node, context);

      // 绘制矩形主体
      graphics.setFillStyle(node.fill);
      graphics.fillRect(0, 0, node.w, node.h);

      // 绘制边框 - 选中时使用不同的样式
      if (isSelected) {
        graphics.setStrokeStyle("#0066cc");
        graphics.setLineWidth(2);
      } else {
        graphics.setStrokeStyle("#333");
        graphics.setLineWidth(1);
      }
      graphics.strokeRect(0, 0, node.w, node.h);

      // 如果有圆角，绘制圆角矩形
      if (node.radius > 0) {
        this.drawRoundedRect(
          graphics,
          0,
          0,
          node.w,
          node.h,
          node.radius,
          node.fill,
          isSelected
        );
      }

      // 绘制标签
      this.drawLabel(graphics, node);

      // 绘制选中状态的额外装饰
      if (isSelected) {
        this.drawSelectionHandles(graphics, node);
      }
    });

    return true;
  }

  /**
   * 绘制圆角矩形
   */
  private drawRoundedRect(
    graphics: IRenderContext["graphics"],
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle: string,
    isSelected?: boolean
  ): void {
    const r = Math.min(radius, width / 2, height / 2);

    graphics.beginPath();
    graphics.moveTo(x + r, y);
    graphics.lineTo(x + width - r, y);
    graphics.arc(x + width - r, y + r, r, -Math.PI / 2, 0);
    graphics.lineTo(x + width, y + height - r);
    graphics.arc(x + width - r, y + height - r, r, 0, Math.PI / 2);
    graphics.lineTo(x + r, y + height);
    graphics.arc(x + r, y + height - r, r, Math.PI / 2, Math.PI);
    graphics.lineTo(x, y + r);
    graphics.arc(x + r, y + r, r, Math.PI, -Math.PI / 2);
    graphics.closePath();

    graphics.setFillStyle(fillStyle);
    graphics.fill();

    if (isSelected) {
      graphics.setStrokeStyle("#0066cc");
      graphics.setLineWidth(2);
    } else {
      graphics.setStrokeStyle("#333");
      graphics.setLineWidth(1);
    }
    graphics.stroke();
  }

  /**
   * 绘制节点标签
   */
  private drawLabel(
    graphics: IRenderContext["graphics"],
    node: Rectangle
  ): void {
    if (!node.id) return;

    // 设置文本样式
    graphics.setFont("12px Arial");
    graphics.setFillStyle("#000");
    graphics.setTextAlign("center");
    graphics.setTextBaseline("middle");

    // 绘制文本
    graphics.fillText(node.id, node.w / 2, node.h / 2);
  }

  /**
   * 绘制选中状态的控制手柄
   */
  private drawSelectionHandles(
    graphics: IRenderContext["graphics"],
    node: Rectangle
  ): void {
    const handleSize = 6;
    const handleColor = "#0066cc";
    const handleBorderColor = "#ffffff";

    // 控制手柄位置
    const handles = [
      { x: -handleSize / 2, y: -handleSize / 2 }, // 左上
      { x: node.w / 2 - handleSize / 2, y: -handleSize / 2 }, // 上中
      { x: node.w - handleSize / 2, y: -handleSize / 2 }, // 右上
      { x: node.w - handleSize / 2, y: node.h / 2 - handleSize / 2 }, // 右中
      { x: node.w - handleSize / 2, y: node.h - handleSize / 2 }, // 右下
      { x: node.w / 2 - handleSize / 2, y: node.h - handleSize / 2 }, // 下中
      { x: -handleSize / 2, y: node.h - handleSize / 2 }, // 左下
      { x: -handleSize / 2, y: node.h / 2 - handleSize / 2 }, // 左中
    ];

    handles.forEach((handle) => {
      // 绘制手柄背景
      graphics.setFillStyle(handleColor);
      graphics.fillRect(handle.x, handle.y, handleSize, handleSize);

      // 绘制手柄边框
      graphics.setStrokeStyle(handleBorderColor);
      graphics.setLineWidth(1);
      graphics.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  }

  /**
   * 检查点是否在矩形内（用于碰撞检测）
   */
  isPointInside(node: Rectangle, x: number, y: number): boolean {
    return (
      x >= node.x && x <= node.x + node.w && y >= node.y && y <= node.y + node.h
    );
  }

  /**
   * 获取矩形边界框
   */
  getBounds(node: Rectangle): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    return {
      x: node.x,
      y: node.y,
      width: node.w,
      height: node.h,
    };
  }
}
