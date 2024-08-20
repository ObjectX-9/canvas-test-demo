export type ViewType = {
  pageX: number;
  pageY: number;
  scale: number;
};


export type Transform = {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
};
export type ArrayTransform = [
  [
      number,
      number,
      number
  ],
  [
      number,
      number,
      number
  ]
];
export type XYWH = {
  x: number;
  y: number;
  w: number;
  h: number;
};
