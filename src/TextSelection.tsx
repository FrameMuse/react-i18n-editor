import "./TextSelection.scss"

import { IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { useEffect, useState } from "react"
import { useEvent, useKey } from "react-use"

import RangedEntries, { RangedEntry } from "./RangedEntries"
import { classWithModifiers } from "./utils"

interface TextSelectionProps {
  rangedEntries: RangedEntries

  onResourceEditorLook?(range: IRange): void
  onCompareRequest?(range: IRange): void
}

function TextSelection(props: TextSelectionProps) {
  const [[selectionStartX, selectionStartY], setSelectionStart] = useState<[number, number]>([0, 0])
  const [[selectionEndX, selectionEndY], setSelectionEnd] = useState<[number, number]>([0, 0])

  const [mouseDown, setMouseDown] = useState(false)

  const [controlKey, setControlKey] = useState(false)

  // Watch for `Control` key
  useKey("Control", () => setControlKey(true), { event: "keydown" })
  useKey("Control", () => setControlKey(false), { event: "keyup" })

  useEvent("mousedown", (event: MouseEvent) => {
    if (!controlKey) return

    if (event.target instanceof Node) {
      const excludedElements = document.querySelectorAll(".i18n-editor, .text-selection, .field")
      if (elementsContain(excludedElements, event.target)) return
    }

    setMouseDown(true)

    setSelectionStart([event.x, event.y])
    setSelectionEnd([event.x, event.y])
  })
  useEvent("mousemove", (event: MouseEvent) => {
    if (!mouseDown) return

    event.preventDefault()

    setSelectionEnd([normalizeAxis(event.x), normalizeAxis(event.y)])
  })
  useEvent("mouseup", () => setMouseDown(false))

  function getModifiers() {
    const modifiers: string[] = []

    if ((Math.abs(selectionEndX) - selectionStartX) < 0) {
      modifiers.push("inverse-x")
    }
    if ((Math.abs(selectionEndY) - selectionStartY) < 0) {
      modifiers.push("inverse-y")
    }

    if (!mouseDown && elements.filter(element => selectionBox.intersects(element.box)).length === 0) {
      modifiers.push("hidden")
    }

    return modifiers
  }

  const [elementMap, setElementMap] = useState<Map<Node, { box: Box; rect: DOMRect }>>(new Map)
  const elements = [...elementMap.values()]

  const selectionBox = new Box(selectionStartX, selectionStartY, selectionEndX, selectionEndY)
  const selectionBoxCenter = selectionBox.getCenter()

  useEffect(() => {
    const rootElement = document.getElementById("root")
    if (rootElement == null) {
      throw new Error("No #root element found.")
    }

    function update(target: Node) {
      const selectedTextNodes = getSelectedTextNodes(target)
      for (const node of selectedTextNodes) {
        const rect = getRectsOfNode(node)

        elementMap.set(node, { rect, box: Box.fromDOMRect(rect) })
      }
    }
    // Initial update.
    update(rootElement)

    const mutationObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.target.parentElement) {
          update(mutation.target.parentElement)
        } else {
          update(mutation.target)
        }
      }

      for (const node of elementMap.keys()) {
        if (document.contains(node)) continue

        elementMap.delete(node)
      }

      setElementMap(new Map(elementMap))
    })

    mutationObserver.observe(rootElement, {
      attributes: true,
      attributeOldValue: true,

      characterData: true,
      characterDataOldValue: true,

      childList: true,
      subtree: true
    })

    return () => {
      mutationObserver.disconnect()
      setElementMap(new Map)
    }
  }, [])

  function asd() {
    const elementsWithEntries: { node: Node; entries: RangedEntry[] }[] = []

    for (const [node, element] of elementMap) {
      if (!selectionBox.intersects(element.box)) continue

      if (node.textContent == null) continue
      if (node.textContent.length === 0) continue

      elementsWithEntries.push({
        node,
        entries: props.rangedEntries.findByValue(node.textContent)
      })
    }

    return elementsWithEntries
  }

  return (
    <>
      <div className="field">
        <div className="field__overlay">
          {elements.map((element, index) => (
            <div className={classWithModifiers("field__element", selectionBox.intersects(element.box) && "active")} style={{
              "--left": element.rect.left,
              "--top": element.rect.top,

              "--width": element.rect.width,
              "--height": element.rect.height
            }} key={index} />
          ))}
        </div>
        <div className={classWithModifiers("field__selection", ...getModifiers())} style={{
          "--left": selectionStartX,
          "--top": selectionStartY,

          "--width": Math.abs(selectionEndX) - selectionStartX,
          "--height": Math.abs(selectionEndY) - selectionStartY
        }} />
      </div>
      <div className={classWithModifiers("text-selection", elements.filter(element => selectionBox.intersects(element.box)).length === 0 && "hidden")} style={{ "--left": selectionBoxCenter.x, "--top": selectionBoxCenter.y }}>
        <div className="text-selection__value">
          {elements.filter(element => selectionBox.intersects(element.box)).length} elements selected
        </div>
        <div className="text-selection__groups">
          {asd().map(({ node, entries }, index) => (
            <div className="text-selection-group" key={index}>
              <div className="text-selection-group__title">{`"${node.textContent}"`}</div>
              <div className="text-selection-group__matches">
                {entries.map((entry, index) => (
                  <div className="text-selection-match" key={index}>
                    <div className="text-selection-match__number">{index + 1}.</div>
                    <div className="text-selection-match__keys">
                      {entry.keys.map(key => (
                        <div className="text-selection-match__key" key={key}>{key}</div>
                      ))}
                    </div>
                    <div className="text-selection-match__buttons">
                      <button className="text-selection-match__button" onClick={() => props.onResourceEditorLook?.(entry.range)}>👀</button>
                      <button className="text-selection-match__button" onClick={() => props.onCompareRequest?.(entry.range)}>📰</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-selection__options">
          {/* <button className="text-selection__option" type="button">See in Resource Editor</button> */}
          {/* <button className="text-selection__option" type="button" onClick={onCompareRequest}>Open in Comparison Table</button> */}
        </div>
        {/* <hr /> */}
        {/* <div className="text-selection__values">
          {elements.filter(element => selectionArea.containsArea(element.area)).map((element, index) => (
            <span key={index}>{element.node.textContent}</span>
          ))}
        </div> */}
      </div>
    </>
  )
}

export default TextSelection

class Box {
  constructor(
    readonly startX: number,
    readonly startY: number,

    readonly endX: number,
    readonly endY: number,
  ) {
    if (endX < startX) {
      this.startX = endX
      this.endX = startX
    }

    if (endY < startY) {
      this.startY = endY
      this.endY = startY
    }
  }

  public intersects(otherBox: Box): boolean {
    if (this.startX >= otherBox.endX) return false
    if (this.startY >= otherBox.endY) return false

    if (this.endX <= otherBox.startX) return false
    if (this.endY <= otherBox.startY) return false

    return true
  }

  public getCenter(): { x: number; y: number } {
    return {
      x: (this.startX + this.endX) / 2,
      y: (this.startY + this.endY) / 2
    }
  }

  static fromDOMRect(domRect: DOMRect): Box {
    return new Box(domRect.left, domRect.top, domRect.right, domRect.bottom)
  }
}

function getSelectedTextNodes(target: Node) {
  const targetIterator = document.createNodeIterator(target, NodeFilter.SHOW_TEXT)
  const excludedElements = document.querySelectorAll(".i18n-editor, .text-selection, .field")

  const textNodes: Node[] = []
  let textNode: Node | null = null
  // eslint-disable-next-line no-cond-assign
  while (textNode = targetIterator.nextNode()) {
    if (textNode.textContent == null) continue
    if (textNode.textContent.length === 0) continue

    if (textNode.textContent === " ") continue
    if (textNode.textContent === "\n") continue
    if (textNode.textContent === "\t") continue

    if (elementsContain(excludedElements, textNode)) {
      continue
    }

    textNodes.push(textNode)
  }


  return textNodes
}

function elementsContain(elements: NodeListOf<Element> | Element[], node: Node): boolean {
  for (const element of elements) {
    if (element.contains(node)) {
      return true
    }
  }

  return false
}

function getRectsOfNode(node: Node): DOMRect {
  const range = document.createRange()
  range.selectNodeContents(node)

  const rects = range.getClientRects()
  return rects[0]
}

function normalizeAxis(axis: number): number {
  if (axis < 0) return 0

  return axis
}
