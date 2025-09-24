import { PencilState, PathPoint } from "../../types/nodes/pencil";
import { BaseNode } from "./baseNode";

/**
 * 铅笔节点类
 */
export class Pencil extends BaseNode {
  _state: PencilState;

  constructor(state: PencilState) {
    super(state);
    this._state = state;
  }

  get type() {
    return "pencil";
  }

  get points(): PathPoint[] {
    return this._state.points || [];
  }

  set points(points: PathPoint[]) {
    this._state.points = points;
    this.updateBounds();
  }

  get strokeWidth(): number {
    return this._state.strokeWidth || 2;
  }

  set strokeWidth(width: number) {
    this._state.strokeWidth = width;
  }

  get strokeColor(): string {
    return this._state.strokeColor || "#000000";
  }

  set strokeColor(color: string) {
    this._state.strokeColor = color;
  }

  get lineCap(): "round" | "square" | "butt" {
    return this._state.lineCap || "round";
  }

  set lineCap(cap: "round" | "square" | "butt") {
    this._state.lineCap = cap;
  }

  get lineJoin(): "round" | "bevel" | "miter" {
    return this._state.lineJoin || "round";
  }

  set lineJoin(join: "round" | "bevel" | "miter") {
    this._state.lineJoin = join;
  }

  get finished(): boolean {
    return this._state.finished || false;
  }

  set finished(finished: boolean) {
    this._state.finished = finished;
  }

  get smoothness(): number {
    return this._state.smoothness || 0.5;
  }

  set smoothness(smoothness: number) {
    this._state.smoothness = Math.max(0, Math.min(1, smoothness));
  }

  /**
   * 添加路径点
   */
  addPoint(x: number, y: number, pressure?: number): void {
    const point: PathPoint = { x, y, pressure };
    this.points.push(point);
    this.updateBounds();
  }

  /**
   * 添加多个路径点
   */
  addPoints(points: PathPoint[]): void {
    this._state.points.push(...points);
    this.updateBounds();
  }

  /**
   * 清空所有路径点
   */
  clearPoints(): void {
    this._state.points = [];
    this.updateBounds();
  }

  /**
   * 获取最后一个路径点
   */
  getLastPoint(): PathPoint | null {
    const points = this.points;
    return points.length > 0 ? points[points.length - 1] : null;
  }

  /**
   * 获取路径长度
   */
  getPathLength(): number {
    const points = this.points;
    if (points.length < 2) return 0;

    let length = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    return length;
  }

  /**
   * 获取平滑后的路径点
   */
  getSmoothPath(): PathPoint[] {
    const points = this.points;
    if (points.length < 3) return points;

    const smoothed: PathPoint[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      const smoothX =
        prev.x * this.smoothness +
        curr.x * (1 - this.smoothness * 2) +
        next.x * this.smoothness;
      const smoothY =
        prev.y * this.smoothness +
        curr.y * (1 - this.smoothness * 2) +
        next.y * this.smoothness;

      smoothed.push({
        x: smoothX,
        y: smoothY,
        pressure: curr.pressure,
      });
    }

    smoothed.push(points[points.length - 1]);
    return smoothed;
  }

  /**
   * 更新节点边界框
   */
  private updateBounds(): void {
    const points = this.points;
    if (points.length === 0) {
      this.x = 0;
      this.y = 0;
      this.w = 0;
      this.h = 0;
      return;
    }

    let minX = points[0].x;
    let maxX = points[0].x;
    let minY = points[0].y;
    let maxY = points[0].y;

    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }

    // 考虑笔触宽度的边界扩展
    const halfStroke = this.strokeWidth / 2;
    this.x = minX - halfStroke;
    this.y = minY - halfStroke;
    this.w = maxX - minX + this.strokeWidth;
    this.h = maxY - minY + this.strokeWidth;
  }

  /**
   * 简化路径（去除冗余点）
   */
  simplifyPath(tolerance: number = 2): void {
    const points = this.points;
    if (points.length <= 2) return;

    const simplified: PathPoint[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
      const prev = simplified[simplified.length - 1];
      const curr = points[i];
      const next = points[i + 1];

      // 计算点到直线的距离
      const distance = this.getPointToLineDistance(curr, prev, next);

      if (distance > tolerance) {
        simplified.push(curr);
      }
    }

    simplified.push(points[points.length - 1]);
    this._state.points = simplified;
    this.updateBounds();
  }

  /**
   * 计算点到直线的距离
   */
  private getPointToLineDistance(
    point: PathPoint,
    lineStart: PathPoint,
    lineEnd: PathPoint
  ): number {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;

    if (lenSq === 0) return Math.sqrt(A * A + B * B);

    const param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  }
}
