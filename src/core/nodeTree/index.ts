import { ElementCollections } from "../types";
import { BaseState } from "../types/nodes/baseState";
import { RectangleState } from "../types/nodes/rectangle";
import { PageState } from "../types/nodes/page";
import { BaseNode } from "./node/baseNode";
import { Rectangle } from "./node/rectangle";
import { Page } from "./node/page";
import { elementStore } from "../store/ElementStore";

export class NodeTree {
  private nodes: Map<string, BaseNode> = new Map();

  addNode(nodeState: BaseState) {
    if (!this.nodes.has(nodeState.id)) {
      // 根据 nodeState 类型创建对应的节点对象
      let node: BaseNode;

      switch (nodeState.type) {
        case "rectangle": {
          node = new Rectangle(nodeState as RectangleState);
          break;
        }
        case "page": {
          node = new Page(nodeState as PageState);
          break;
        }
        default:
          throw new Error(`Unsupported node type: ${nodeState.type}`);
      }

      // 将节点对象添加到节点树
      this.nodes.set(nodeState.id, node);

      // 将 nodeState 添加到 elementStore
      elementStore.addElement(nodeState.id, nodeState);
    }
  }

  removeNode(id: string) {
    if (this.nodes.has(id)) {
      this.nodes.delete(id);
    }
  }

  getNodeById(id: string) {
    return this.nodes.get(id);
  }

  getAllNodes() {
    return Array.from(this.nodes.values()) as unknown as BaseNode[];
  }

  createAllElements(elements: ElementCollections) {
    Object.values(elements).forEach((elemState) => {
      // 直接使用重构后的 addNode 方法
      this.addNode(elemState);
    });
  }
}

export const nodeTree = new NodeTree();
