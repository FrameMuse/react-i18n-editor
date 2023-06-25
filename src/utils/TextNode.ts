/**
 * Utils to work with `TEXT_NODE` nodes.
 */
class TextNode {
  /**
   * Finds all `TEXT_NODE` nodes in given `node`.
   *
   * If given `node` is `TEXT_NODE`, returns only it as array.
   */
  static findAllIn(node: Node): Node[] {
    if (node.nodeType === node.TEXT_NODE) {
      return [node]
    }

    const nodeIterator = document.createNodeIterator(node, NodeFilter.SHOW_TEXT)

    const textNodes: Node[] = []
    let textNode: Node | null = null
    // eslint-disable-next-line no-cond-assign
    while (textNode = nodeIterator.nextNode()) {
      if (textNode.textContent == null) continue
      if (textNode.textContent.length === 0) continue

      if (textNode.textContent === " ") continue
      if (textNode.textContent === "\n") continue
      if (textNode.textContent === "\t") continue

      textNodes.push(textNode)
    }

    return textNodes
  }

  /**
   * Iterates through every `TEXT_NODE` node of every given node.
   */
  static traverseAll(nodes: Node[] | NodeList, iteratee: (textNode: Node) => void): void {
    for (const node of nodes) {
      const textNodes = TextNode.findAllIn(node)

      for (const textNode of textNodes) {
        iteratee(textNode)
      }
    }
  }

  static getRects(textNode: Node, bounding = false): DOMRect[] {
    const range = document.createRange()
    range.selectNodeContents(textNode)

    if (bounding) {
      const rect = range.getBoundingClientRect()
      return [rect]
    }

    const rects = range.getClientRects()
    return [...rects]
  }

  /**
   * Unused method, but may be useful in future.
   */
  static getStyleProperty(textNode: Node, property: keyof CSSStyleDeclaration): string | undefined {
    const parentElement = textNode.parentElement
    if (parentElement == null) return

    const style = window.getComputedStyle(parentElement)
    const styleProperty = style[property]?.toString()

    return styleProperty
  }

  static getMaxZIndex(textNode: Node, boundary?: Node): number | undefined {
    let maxZIndex: number | undefined = undefined


    let element = textNode.parentElement
    // eslint-disable-next-line no-cond-assign
    while (element) {
      const zIndex = parseInt(window.getComputedStyle(element).zIndex)
      if (zIndex > (maxZIndex ?? -Infinity)) {
        maxZIndex = zIndex
      }

      if (element === boundary) {
        return maxZIndex
      }

      element = element.parentElement
    }


    return maxZIndex
  }

  static isVisible(textNode: Node, boundary?: Node): boolean {
    let element = textNode.parentElement
    // eslint-disable-next-line no-cond-assign
    while (element) {
      const style = window.getComputedStyle(element)
      if (style.visibility === "hidden") {
        return false
      }
      if (style.display === "none") {
        return false
      }
      if (style.opacity === "0") {
        return false
      }

      if (element === boundary) {
        return true
      }

      element = element.parentElement
    }

    return true
  }
}

export default TextNode
