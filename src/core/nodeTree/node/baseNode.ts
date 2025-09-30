import { getCkTypeByType } from "@/core/render/direct/CanvasElementFactory";
import { BaseState } from "../../types/nodes/baseState";
import { SkiaNode } from "./skiaNode";

export class BaseNode extends SkiaNode {
  _state: BaseState;

  constructor(state: BaseState) {
    super();
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

  get name() {
    return this._state.name ?? "base";
  }

  set name(name: string) {
    this._state.name = name;
  }

  get type() {
    return this._state.type ?? "base";
  }

  get skiaType() {
    return getCkTypeByType(this.type);
  }

  get x() {
    return this._state.x ?? 0;
  }

  set x(x: number) {
    this._state.x = x;
  }

  get y() {
    return this._state.y ?? 0;
  }

  set y(y: number) {
    this._state.y = y;
  }

  get w() {
    return this._state.w ?? 0;
  }

  set w(w: number) {
    this._state.w = w;
  }

  get h() {
    return this._state.h ?? 0;
  }

  set h(h: number) {
    this._state.h = h;
  }

  get rotation() {
    return this._state.rotation ?? 0;
  }

  changeFills() {
    this.fill = "#eeddss";
  }
}
