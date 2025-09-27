import { BaseNode } from "../../nodeTree/node/baseNode";
import { Pencil } from "../../nodeTree/node/pencil";
import { PathPoint } from "../../types/nodes/pencilState";
import { BaseNodeRenderer } from "../NodeRenderer";
import { IRenderContext } from "../interfaces/IGraphicsAPI";
import { selectionStore } from "../../store/SelectionStore";

/**
 * 铅笔节点渲染器
 */
export class PencilRenderer extends BaseNodeRenderer<Pencil> {
  readonly type = "pencil";
  priority = 15;

  canRender(node: BaseNode): boolean {
    return node && node.type === "pencil";
  }

  getSupportedNodeTypes(): string[] {
    return ["pencil"];
  }

  renderNode(node: Pencil, context: IRenderContext): boolean {
    const { graphics } = context;
    const isSelected = selectionStore.isNodeSelected(node.id);

    // 如果没有路径点，不进行渲染
    if (node.points.length === 0) {
      return true;
    }

    this.withGraphicsState(context, () => {
      // 设置基础样式
      graphics.setStrokeStyle(node.strokeColor);
      graphics.setLineCap(node.lineCap);
      graphics.setLineJoin(node.lineJoin);

      // 根据是否选中设置不同的透明度
      if (isSelected) {
        graphics.setGlobalAlpha(0.8);
      }

      // 绘制路径
      if (node.smoothness > 0 && node.points.length > 2) {
        this.drawSmoothPath(node, graphics);
      } else {
        this.drawRawPath(node, graphics);
      }

      // 如果选中，绘制选中状态的装饰
      if (isSelected) {
        graphics.setGlobalAlpha(1);
        this.drawSelectionDecorations(node, graphics);
      }

      // 如果未完成绘制，绘制当前正在绘制的提示
      if (!node.finished) {
        this.drawDrawingIndicator(node, graphics);
      }
    });

    return true;
  }

  /**
   * 绘制原始路径（直线连接）
   */
  private drawRawPath(
    node: Pencil,
    graphics: IRenderContext["graphics"]
  ): void {
    const points = node.points;
    if (points.length < 2) return;

    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      const point = points[i];

      // 如果支持压力感应，调整线宽
      if (point.pressure !== undefined) {
        const pressureWidth = node.strokeWidth * (0.5 + point.pressure * 0.5);
        graphics.setLineWidth(pressureWidth);
      } else {
        graphics.setLineWidth(node.strokeWidth);
      }

      graphics.lineTo(point.x, point.y);
    }

    graphics.stroke();
  }

  /**
   * 绘制平滑路径（二次贝塞尔曲线）
   */
  private drawSmoothPath(
    node: Pencil,
    graphics: IRenderContext["graphics"]
  ): void {
    const points = node.points;
    if (points.length < 2) return;

    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);

    if (points.length === 2) {
      // 只有两个点，绘制直线
      graphics.setLineWidth(node.strokeWidth);
      graphics.lineTo(points[1].x, points[1].y);
    } else {
      // 使用二次贝塞尔曲线平滑路径
      for (let i = 1; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];

        // 计算控制点
        const cpX = (current.x + next.x) / 2;
        const cpY = (current.y + next.y) / 2;

        // 应用压力感应
        if (current.pressure !== undefined) {
          const pressureWidth =
            node.strokeWidth * (0.3 + current.pressure * 0.7);
          graphics.setLineWidth(pressureWidth);
        } else {
          graphics.setLineWidth(node.strokeWidth);
        }

        graphics.quadraticCurveTo(current.x, current.y, cpX, cpY);
      }

      // 绘制到最后一个点
      const lastPoint = points[points.length - 1];
      graphics.lineTo(lastPoint.x, lastPoint.y);
    }

    graphics.stroke();
  }

  /**
   * 绘制选中状态的装饰
   */
  private drawSelectionDecorations(
    node: Pencil,
    graphics: IRenderContext["graphics"]
  ): void {
    // 绘制边界框
    graphics.setStrokeStyle("#0066cc");
    graphics.setLineWidth(1);
    graphics.setLineDash([5, 5]);
    graphics.strokeRect(node.x, node.y, node.w, node.h);
    graphics.setLineDash([]);

    // 绘制起点和终点标记
    const points = node.points;
    if (points.length > 0) {
      // 起点 - 绿色圆圈
      this.drawPoint(graphics, points[0], "#00cc66", 4);

      // 终点 - 红色圆圈
      if (points.length > 1) {
        this.drawPoint(graphics, points[points.length - 1], "#cc6600", 4);
      }
    }

    // 绘制路径关键点（仅在路径较短时显示）
    if (points.length <= 20) {
      graphics.setFillStyle("#0066cc");
      for (let i = 1; i < points.length - 1; i++) {
        this.drawPoint(graphics, points[i], "#0066cc", 2);
      }
    }
  }

  /**
   * 绘制正在绘制的指示器
   */
  private drawDrawingIndicator(
    node: Pencil,
    graphics: IRenderContext["graphics"]
  ): void {
    const lastPoint = node.getLastPoint();
    if (!lastPoint) return;

    // 绘制闪烁的光标
    const time = Date.now();
    const alpha = Math.abs(Math.sin(time * 0.01)) * 0.5 + 0.5;

    graphics.setGlobalAlpha(alpha);
    this.drawPoint(graphics, lastPoint, node.strokeColor, node.strokeWidth + 2);
    graphics.setGlobalAlpha(1);
  }

  /**
   * 绘制点标记
   */
  private drawPoint(
    graphics: IRenderContext["graphics"],
    point: PathPoint,
    color: string,
    radius: number
  ): void {
    graphics.setFillStyle(color);
    graphics.beginPath();
    graphics.arc(point.x, point.y, radius, 0, Math.PI * 2);
    graphics.fill();
  }

  /**
   * 检查点是否在路径上（用于碰撞检测）
   */
  isPointOnPath(
    node: Pencil,
    x: number,
    y: number,
    tolerance: number = 5
  ): boolean {
    const points = node.points;
    if (points.length === 0) return false;

    // 检查点是否在边界框内
    if (
      x < node.x - tolerance ||
      x > node.x + node.w + tolerance ||
      y < node.y - tolerance ||
      y > node.y + node.h + tolerance
    ) {
      return false;
    }

    // 检查与路径的最小距离
    let minDistance = Infinity;

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];
      const distance = this.getPointToLineDistance(
        x,
        y,
        p1.x,
        p1.y,
        p2.x,
        p2.y
      );
      minDistance = Math.min(minDistance, distance);

      if (minDistance <= tolerance + node.strokeWidth / 2) {
        return true;
      }
    }

    return false;
  }

  /**
   * 计算点到线段的距离
   */
  private getPointToLineDistance(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) return Math.sqrt(A * A + B * B);

    const param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * 获取铅笔节点边界框
   */
  getBounds(node: Pencil): {
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
