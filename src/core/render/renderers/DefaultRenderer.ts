import { BaseNode } from "../../nodeTree/node/baseNode";
import { BaseNodeRenderer, RenderContext } from "../NodeRenderer";

/**
 * 默认节点渲染器
 * 用于渲染没有专用渲染器的节点类型
 */
export class DefaultRenderer extends BaseNodeRenderer<BaseNode> {
  readonly type = "default";
  priority = -1; // 最低优先级

  render(node: BaseNode, context: RenderContext): void {
    const { ctx } = context;

    this.withCanvasState(context, () => {
      // 应用节点变换
      this.applyNodeTransform(node, context);

      // 绘制默认的占位符矩形
      this.drawPlaceholder(node, ctx);

      // 绘制节点信息
      this.drawNodeInfo(node, ctx);
    });
  }

  /**
   * 总是返回true，作为兜底渲染器
   */
  canRender(_node: BaseNode): _node is BaseNode {
    return true;
  }

  /**
   * 绘制占位符
   */
  private drawPlaceholder(node: BaseNode, ctx: CanvasRenderingContext2D): void {
    // 绘制虚线边框的矩形
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, node.w, node.h);

    // 绘制半透明背景
    ctx.fillStyle = "rgba(200, 200, 200, 0.3)";
    ctx.fillRect(0, 0, node.w, node.h);

    // 绘制对角线
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(node.w, node.h);
    ctx.moveTo(node.w, 0);
    ctx.lineTo(0, node.h);
    ctx.stroke();

    // 重置线条样式
    ctx.setLineDash([]);
  }

  /**
   * 绘制节点信息
   */
  private drawNodeInfo(node: BaseNode, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#666";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const centerX = node.w / 2;
    const centerY = node.h / 2;

    // 绘制节点类型和ID
    ctx.fillText(`类型: ${node.type}`, centerX, centerY - 10);
    ctx.fillText(`ID: ${node.id}`, centerX, centerY + 10);

    // 如果空间足够，显示尺寸信息
    if (node.w > 80 && node.h > 60) {
      ctx.fillText(`${node.w} × ${node.h}`, centerX, centerY + 25);
    }
  }
}
