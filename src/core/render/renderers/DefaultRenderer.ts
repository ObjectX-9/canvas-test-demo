import { BaseNode } from "../../nodeTree/node/baseNode";
import { BaseNodeRenderer } from "../NodeRenderer";
import { IRenderContext } from "../interfaces/IGraphicsAPI";

/**
 * 默认节点渲染器
 * 用于渲染未知类型的节点
 */
export class DefaultRenderer extends BaseNodeRenderer<BaseNode> {
  readonly type = "default";
  priority = 0;

  canRender(): boolean {
    // 默认渲染器可以渲染任何节点
    return true;
  }

  getSupportedNodeTypes(): string[] {
    return ["*"]; // 表示支持所有类型
  }

  renderNode(node: BaseNode, context: IRenderContext): boolean {
    const { graphics } = context;

    this.withGraphicsState(context, () => {
      // 应用节点变换
      this.applyTransform(context, node);

      // 绘制占位符矩形
      graphics.setStrokeStyle("#ff0000");
      graphics.setLineWidth(2);
      graphics.strokeRect(0, 0, node.w, node.h);

      // 绘制对角线
      graphics.beginPath();
      graphics.moveTo(0, 0);
      graphics.lineTo(node.w, node.h);
      graphics.moveTo(node.w, 0);
      graphics.lineTo(0, node.h);
      graphics.stroke();

      // 绘制未知节点标识
      graphics.setFillStyle("#ff0000");
      graphics.setFont("12px Arial");
      graphics.setTextAlign("center");
      graphics.setTextBaseline("middle");
      graphics.fillText(`未知类型: ${node.type}`, node.w / 2, node.h / 2);
    });

    return true;
  }
}
