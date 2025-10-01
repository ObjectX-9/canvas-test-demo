import { SkiaNode } from "./skiaNode";
import { ContainerState } from "@/core/types/nodes/container";

export class ContainerNode extends SkiaNode {
  _state: ContainerState;
  constructor(state: ContainerState) {
    super(state);
    this._state = state;
  }

  get children() {
    return this._state.children;
  }

  set children(children: string[]) {
    this._state.children = children;
  }
}
