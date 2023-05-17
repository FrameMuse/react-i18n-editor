import Point from "./Point"

class Box {
  static NULL = new Box(0, 0, 0, 0)

  width: number
  height: number

  center: Point
  invertedX = false
  invertedY = false

  constructor(
    readonly startX: number,
    readonly startY: number,

    readonly endX: number,
    readonly endY: number,
  ) {
    this.width = Math.abs(endX - startX)
    this.height = Math.abs(endY - startY)

    // Resolve axis inversion.
    if (endX < startX) {
      this.startX = endX
      this.endX = startX

      this.invertedX = true
    }
    if (endY < startY) {
      this.startY = endY
      this.endY = startY

      this.invertedY = true
    }

    this.center = this.getCenter()
  }

  public intersects(otherBox: Box): boolean {
    if (this.startX >= otherBox.endX) return false
    if (this.startY >= otherBox.endY) return false

    if (this.endX <= otherBox.startX) return false
    if (this.endY <= otherBox.startY) return false

    return true
  }

  private getCenter(): Point {
    return new Point(
      (this.startX + this.endX) / 2,
      (this.startY + this.endY) / 2
    )
  }

  static fromRect(domRect: DOMRect): Box {
    return new Box(domRect.left, domRect.top, domRect.right, domRect.bottom)
  }
  /**
   * Same as `fromRect` but includes `window.scrollX` and `window.scrollY`.
   */
  static fromRectWithScroll(domRect: DOMRect): Box {
    return new Box(
      domRect.left + window.scrollX,
      domRect.top + window.scrollY,
      domRect.right + window.scrollX,
      domRect.bottom + window.scrollY
    )
  }

  static fromPoints(start: Point, end: Point): Box {
    return new Box(start.x, start.y, end.x, end.y)
  }
}

export default Box
