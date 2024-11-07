import { BaseState } from "../core/types/nodes/baseState";

export function getBasicElement(): Record<string, BaseState> {
  return {
    "1": {
      id: "1",
      type: "rectangle",
      fill: "#ffee00",
      x: 100,
      y: 100,
      w: 100,
      h: 100,
      rotation: 0,
    },
    "2": {
      id: "2",
      type: "rectangle",
      fill: "#ffaa00",
      x: 200,
      y: 200,
      w: 100,
      h: 100,
      rotation: 0,
    },
  };
}
