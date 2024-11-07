import { ElementCollections } from "../types";
import { BaseState } from "../types/nodes/baseState";
import { RectangleState } from "../types/nodes/rectangle";
import { Rectangle } from "./node/rectangle";

export class NodeTree {
  private nodes: Map<string, BaseState> = new Map();

  addNode(nodeState: BaseState) {
    if (!this.nodes.has(nodeState.id)) {
      this.nodes.set(nodeState.id, nodeState);
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
    return this.nodes;
  }

  createAllElements(elements: ElementCollections) {
    Object.values(elements).forEach((elemState) => {
      switch (elemState.type) {
        case "rectangle": {
          const rect = new Rectangle(elemState as RectangleState);
          this.addNode(rect);
        }
      }
    });
  }
}

export const nodeTree = new NodeTree();
