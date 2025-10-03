import { BaseNode } from "../nodeTree/node/baseNode";

/**
 * 点击检测工具
 */
export class HitTestUtils {
  /**
   * 检测点是否在矩形节点内
   * @param point 世界坐标系中的点
   * @param node 节点对象
   * @returns 是否命中
   */
  static isPointInRectangle(
    point: { x: number; y: number },
    node: BaseNode
  ): boolean {
    const { x, y, w, h, rotation } = node;

    if (rotation === 0) {
      // 没有旋转的情况，简单的矩形检测
      return (
        point.x >= x && point.x <= x + w && point.y >= y && point.y <= y + h
      );
    } else {
      // 有旋转的情况，需要反向旋转点来检测
      const centerX = x + w / 2;
      const centerY = y + h / 2;

      // 将点相对于矩形中心的坐标
      const relativeX = point.x - centerX;
      const relativeY = point.y - centerY;

      // 反向旋转
      const cos = Math.cos(-rotation);
      const sin = Math.sin(-rotation);

      const rotatedX = relativeX * cos - relativeY * sin;
      const rotatedY = relativeX * sin + relativeY * cos;

      // 检测旋转后的点是否在矩形内
      return (
        rotatedX >= -w / 2 &&
        rotatedX <= w / 2 &&
        rotatedY >= -h / 2 &&
        rotatedY <= h / 2
      );
    }
  }

  /**
   * 检测点是否在节点内（支持不同类型的节点）
   * @param point 世界坐标系中的点
   * @param node 节点对象
   * @returns 是否命中
   */
  static isPointInNode(
    point: { x: number; y: number },
    node: BaseNode
  ): boolean {
    switch (node.type) {
      case "rectangle":
        return this.isPointInRectangle(point, node);
      // 可以添加其他类型的节点检测
      default:
        return this.isPointInRectangle(point, node);
    }
  }

  /**
   * 从节点列表中找到被点击的节点（按z-index从高到低查找）
   * @param point 世界坐标系中的点
   * @param nodes 节点对象列表
   * @returns 被点击的节点，如果没有则返回null
   */
  static findNodeAtPoint(
    point: { x: number; y: number },
    nodes: BaseNode[]
  ): BaseNode | null {
    // 从后往前查找（后面的节点层级更高）
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (this.isPointInNode(point, node)) {
        return node;
      }
    }
    return null;
  }
}
