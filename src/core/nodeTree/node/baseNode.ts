import { BaseState } from "../../types/nodes/baseState";

export class BaseNode {
  _state: BaseState;

  constructor(state: BaseState) {
    this._state = state;
  }

  get id() {
    return this._state.id ?? "1";
  }

  get fill() {
    return this._state.fill ?? "#eeffaa";
  }

  set fill(fill: string) {
    this._state.fill = fill;
  }

  get type() {
    return this._state.type ?? "base";
  }

  get x() {
    return this._state.x ?? 0;
  }

  get y() {
    return this._state.y ?? 0;
  }

  get w() {
    return this._state.w ?? 0;
  }

  get h() {
    return this._state.h ?? 0;
  }

  get rotation() {
    return this._state.rotation ?? 0;
  }

  changeFills() {
    this.fill = "#eeddss";
  }
}
