class Point {
  static NULL = Object.freeze(new Point(0, 0))

  constructor(public x: number, public y: number) {}

  public normalize() {
    if (this.x < 0) this.x = 0
    if (this.y < 0) this.y = 0
  }

  static fromPointLike(point: { x: number, y: number }): Point {
    return new Point(point.x, point.y)
  }
}

export default Point
