import { RectangleState } from "../../types/nodes/rectangle";
import { BaseNode } from "./baseNode";

export class Rectangle extends BaseNode {
  _state: RectangleState;
  constructor(state: RectangleState) {
    super(state);
    this._state = state;
  }

  get radius() {
    return this._state.radius ?? 0;
  }

  get type() {
    return "rectangle";
  }
}
