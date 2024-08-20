import { Transform, ViewType } from "../core/types";

export function getBasicView(): ViewType {
  return {
    scale: 1,
    pageX: 0,
    pageY: 0,
  };
}

type TransformOptions = {
  x?: number,
  y?: number,
}
/**
 * 根据x,y获取默认transform
 * @returns {Transform}
 */
export const defaultTransform = function (options: TransformOptions = {}): Transform {
  const {
    x = 0,
    y = 0,
  } = options;
  return {
    m00: 1,
    m01: 0,
    m02: x,
    m10: 0,
    m11: 1,
    m12: y
  };
};

