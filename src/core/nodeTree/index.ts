import { BaseState } from "../types/nodes/baseState";
import { RectangleState } from "../types/nodes/rectangleState";
import { PencilState } from "../types/nodes/pencilState";
import { PageState } from "../types/nodes/pageState";
import { BaseNode } from "./node/baseNode";
import { Rectangle } from "./node/rectangle";
import { Pencil } from "./node/pencil";
import { PageNode } from "./node/pageNode";
import { elementStore } from "../store/ElementStore";
import { pageStore } from "../store/PageStore";
import { SkiaNode } from "./node/skiaNode";
import { pageManager } from "../manage/PageManager";

export class NodeTree {
  private nodes: Map<string, SkiaNode> = new Map();

  addNode(nodeState: BaseState) {
    if (!this.nodes.has(nodeState.id)) {
      // 根据 nodeState 类型创建对应的节点对象
      let node: BaseNode;

      switch (nodeState.type) {
        case "rectangle": {
          node = new Rectangle(nodeState as RectangleState);
          break;
        }
        case "pencil": {
          node = new Pencil(nodeState as PencilState);
          break;
        }
        case "page": {
          node = new PageNode(nodeState as PageState);
          break;
        }
        default:
          throw new Error(`Unsupported node type: ${nodeState.type}`);
      }

      // 将节点对象添加到节点树
      this.nodes.set(nodeState.id, node as SkiaNode);

      if (nodeState.type === "page") {
        pageStore.addPage(nodeState.id, nodeState as PageState);
      } else {
        // 将 nodeState 添加到 elementStore
        elementStore.addElement(nodeState.id, nodeState);

        // 自动将非页面节点添加到当前页面的children中
        const currentPage = pageManager.getCurrentPage();
        if (currentPage && !currentPage.children.includes(nodeState.id)) {
          currentPage.addChild(nodeState.id);
          console.log(
            `🌲 节点 ${nodeState.id} (${nodeState.type}) 已自动添加到页面 ${currentPage.id}`
          );
        }
      }
    }
  }

  removeNode(id: string) {
    const node = this.getNodeById(id);
    if (node) {
      // 从节点树中移除
      this.nodes.delete(id);
      // 从state中移除
      if (node.type === "page") {
        pageStore.removePage(id);
      } else {
        elementStore.removeElement(id);

        // 从当前页面的children中移除
        const currentPage = pageManager.getCurrentPage();
        if (currentPage && currentPage.children.includes(id)) {
          currentPage.removeChild(id);
          console.log(
            `🌲 节点 ${id} (${node.type}) 已从页面 ${currentPage.id} 中移除`
          );
        }
      }
    }
  }

  getNodeById(id: string) {
    return this.nodes.get(id);
  }

  getAllNodes() {
    return Array.from(this.nodes.values()) as unknown as BaseNode[];
  }

  createAllElements(elements: Record<string, BaseState>) {
    Object.values(elements).forEach((elemState) => {
      // 直接使用重构后的 addNode 方法
      this.addNode(elemState);
    });
  }
}

export const nodeTree = new NodeTree();
