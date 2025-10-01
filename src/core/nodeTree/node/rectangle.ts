import { RectangleState } from "../../types/nodes/rectangleState";
import { SkiaNode } from "./skiaNode";

export class Rectangle extends SkiaNode {
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
