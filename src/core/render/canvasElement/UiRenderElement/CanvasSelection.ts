import { CanvasElement } from "../Element/CanvasBaseElement";
import { RenderContext } from "../types";
import { RenderApi } from "../../renderApi/type";
import { selectionStore } from "../../../store/SelectionStore";
import { nodeTree } from "../../../nodeTree";

/**
 * 选择框渲染元素的属性
 */
export interface CanvasSelectionProps {
  strokeStyle?: string;
  fillStyle?: string;
  lineWidth?: number;
  selectedStrokeStyle?: string;
  selectedLineWidth?: number;
  visible?: boolean;
  [key: string]: unknown; // 添加索引签名以满足 BaseCanvasElementProps 约束
}

/**
 * Canvas选择框渲染元素
 * 负责渲染选中节点的边框
 */
export class CanvasSelection extends CanvasElement<
  "canvas-selection",
  CanvasSelectionProps
> {
  readonly type = "canvas-selection" as const;

  protected onRender(context: RenderContext): void {
    const { renderApi } = context;

    const selectedStrokeStyle = this.props.selectedStrokeStyle || "#007bff";
    const selectedLineWidth = this.props.selectedLineWidth || 2;
    const visible = this.props.visible !== false;

    if (!visible) return;

    renderApi.save();

    try {
      // 渲染选中节点的边框
      this.renderSelectedNodesBorders(
        renderApi,
        selectedStrokeStyle,
        selectedLineWidth
      );
    } finally {
      renderApi.restore();
    }
  }

  private renderSelectedNodesBorders(
    renderApi: RenderApi,
    strokeStyle: string,
    lineWidth: number
  ): void {
    const selectedIds = selectionStore.getSelectedNodeIds();
    if (selectedIds.length === 0) {
      return;
    }

    // 设置选中边框样式
    renderApi.setStrokeStyle(strokeStyle);
    renderApi.setLineWidth(lineWidth);

    // 为每个选中的节点绘制边框
    selectedIds.forEach((nodeId) => {
      this.renderNodeBorder(renderApi, nodeId);
    });
  }

  private renderNodeBorder(renderApi: RenderApi, nodeId: string): void {
    // 使用 nodeTree.getNodeById 获取节点信息
    const node = nodeTree.getNodeById(nodeId);

    if (!node) {
      console.warn(`🔲 找不到节点: ${nodeId}`);
      return;
    }

    const { x, y, w, h } = node;

    // 添加一些边距使边框更明显
    const margin = 2;
    const borderX = x - margin;
    const borderY = y - margin;
    const borderW = w + margin * 2;
    const borderH = h + margin * 2;

    // 绘制选中边框（使用可用的路径API）
    renderApi.beginPath();
    renderApi.moveTo(borderX, borderY);
    renderApi.lineTo(borderX + borderW, borderY);
    renderApi.lineTo(borderX + borderW, borderY + borderH);
    renderApi.lineTo(borderX, borderY + borderH);
    renderApi.lineTo(borderX, borderY);
    renderApi.stroke();

    // 绘制四个角的小方块（类似Figma的控制点）
    this.renderCornerHandles(renderApi, borderX, borderY, borderW, borderH);

    console.log(
      `🔲 渲染选中边框: ${nodeId} (${borderX}, ${borderY}) ${borderW}x${borderH}`
    );
  }

  private renderCornerHandles(
    renderApi: RenderApi,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const handleSize = 6;
    const halfHandle = handleSize / 2;

    // 设置控制点样式
    renderApi.setFillStyle("#ffffff");
    renderApi.setStrokeStyle("#007bff");
    renderApi.setLineWidth(1);

    // 四个角的控制点位置
    const corners = [
      { x: x - halfHandle, y: y - halfHandle }, // 左上
      { x: x + width - halfHandle, y: y - halfHandle }, // 右上
      { x: x + width - halfHandle, y: y + height - halfHandle }, // 右下
      { x: x - halfHandle, y: y + height - halfHandle }, // 左下
    ];

    corners.forEach((corner) => {
      // 绘制控制点边框（使用可用的路径API）
      renderApi.setStrokeStyle("#007bff");
      renderApi.setLineWidth(1);

      renderApi.beginPath();
      renderApi.moveTo(corner.x, corner.y);
      renderApi.lineTo(corner.x + handleSize, corner.y);
      renderApi.lineTo(corner.x + handleSize, corner.y + handleSize);
      renderApi.lineTo(corner.x, corner.y + handleSize);
      renderApi.lineTo(corner.x, corner.y);
      renderApi.stroke();
    });
  }
}
