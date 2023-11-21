import Box from "@/geometry/Box"
import TextNode from "@/utils/TextNode"

export type TextSelectionNodeFlatten = (Omit<TextSelectionNode, "boxes"> & { box: Box })

interface TextSelectionNodeStyles {
  zIndex: number
  visibility: "visible" | "hidden"
}

class TextSelectionNode {
  boxes: Box[]

  /**
   * Whether intersected with selection box.
   */
  private intersected: boolean
  public selected: boolean

  /**
   * Copied value, will not follow any updates from origin.
   */
  textContent: string

  styles: Partial<TextSelectionNodeStyles> = {}


  constructor(private textNode: Node, selectionBox: Box, private root?: Node) {
    if (textNode.nodeType !== Node.TEXT_NODE) {
      throw new TypeError("Given `textNode` isn't a TEXT_NODE.")
    }

    if (textNode.textContent == null) {
      throw new Error("`textNode.textContent` is null.")
    }

    const rects = TextNode.getRects(textNode, false)

    this.boxes = rects.map(Box.fromRectWithScroll)
    this.intersected = this.boxes.some(box => selectionBox.intersects(box))
    this.textContent = textNode.textContent

    this.styles = this.composeStyles()


    this.selected = this.intersected && this.styles.visibility === "visible"
  }
  private composeStyles(): Partial<TextSelectionNodeStyles> {
    return {
      zIndex: TextNode.getMaxZIndex(this.textNode, this.root),
      visibility: TextNode.isVisible(this.textNode, this.root) ? "visible" : "hidden"
    }
  }

  public flat(): TextSelectionNodeFlatten[] {
    return this.boxes.map(box => ({ ...this, box }))
  }

}

export default TextSelectionNode
