export function getTextNodes(root: Node): Node[] {
  const nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT)

  const textNodes: Node[] = []
  let textNode: Node | null = null
  // eslint-disable-next-line no-cond-assign
  while (textNode = nodeIterator.nextNode()) {
    if (textNode.textContent == null) continue
    if (textNode.textContent.length === 0) continue

    if (textNode.textContent === " ") continue
    if (textNode.textContent === "\n") continue
    if (textNode.textContent === "\t") continue

    if (excludedContains(textNode)) continue

    textNodes.push(textNode)
  }

  return textNodes
}

export function getNodeRect(node: Node): DOMRect {
  const range = document.createRange()
  range.selectNodeContents(node)

  const rects = range.getClientRects()
  return rects[0]
}

export function elementsContain(elements: NodeListOf<Element> | Element[], node: Node): boolean {
  for (const element of elements) {
    if (element.contains(node)) {
      return true
    }
  }

  return false
}

/**
 * Checks if any of the excluded elements contain a target.
 */
export function excludedContains(target: unknown) {
  if (target instanceof Node) {
    const excludedElements = document.querySelectorAll(".i18n-editor, .selected-entries, .field")

    if (elementsContain(excludedElements, target)) {
      return true
    }
  }

  return false
}
