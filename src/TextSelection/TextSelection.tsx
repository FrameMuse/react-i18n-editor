import Box from "geometry/Box"
import Point from "geometry/Point"
import { IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { useEffect, useMemo, useRef, useState } from "react"
import { useEvent, useKey } from "react-use"

import RangedEntries from "../RangedEntries"
import SelectedEntriesWindow from "./components/SelectedEntriesWindow/SelectedEntriesWindow"
import SelectionBox from "./components/SelectionBox/SelectionBox"
import { excludedContains, getNodeRect, getTextNodes } from "./TextSelection.helpers"

export interface SelectionEntry {
  box: Box
  textContent: string
  /**
   * Whether the entry is intersected with selection box.
   */
  selected: boolean
}

export interface TextSelectionProps {
  rangedEntries: RangedEntries

  onResourceEditorReveal?(range: IRange): void
  onCompareRequest?(range: IRange): void
}

function TextSelection(props: TextSelectionProps) {
  // Getting "Control" key state //

  const [controlKey, setControlKey] = useState(false)

  useKey("Control", () => setControlKey(true), { event: "keydown" })
  useKey("Control", () => setControlKey(false), { event: "keyup" })

  // Calculating selection box //

  const [pointerDown, setPointerDown] = useState(false)
  const [selectionBox, setSelectionBox] = useState<Box>(Box.NULL)

  const selectionStartRef = useRef<Point>(Point.NULL)
  const selectionEndRef = useRef<Point>(Point.NULL)

  useEvent("pointerdown", (event: PointerEvent) => {
    if (!controlKey) return
    if (excludedContains(event.target)) return

    event.preventDefault()

    selectionStartRef.current = Point.fromPointLike(event)
    setPointerDown(true)
  })
  useEvent("pointerup", (event: PointerEvent) => {
    if (!pointerDown) return

    event.preventDefault()

    setPointerDown(false)
  })
  useEvent("pointermove", (event: PointerEvent) => {
    if (!controlKey) return
    if (!pointerDown) return

    event.preventDefault()

    selectionEndRef.current = Point.fromPointLike(event)
    setSelectionBox(Box.fromPoints(selectionStartRef.current, selectionEndRef.current))
  })

  // Getting text nodes //

  const [textNodes, setTextNodes] = useState<Set<Node>>(new Set)

  function clearObsoleteTextNodes() {
    for (const node of textNodes) {
      if (document.contains(node)) continue

      textNodes.delete(node)
      setTextNodes(textNodes)
    }
  }

  useEffect(() => {
    // TODO: Probably move `rootElement` to context or props.
    const rootElement = document.getElementById("root")
    if (rootElement == null) {
      throw new Error("No #root element found.")
    }
    // Initial update.
    onNodeUpdate(rootElement)

    function onNodeUpdate(node: Node) {
      const textNodes = getTextNodes(node)

      setTextNodes(currentTextNodes => new Set([...currentTextNodes, ...textNodes]))
    }


    const mutationObserver = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        // Broaden update area.
        if (mutation.target.parentElement) {
          onNodeUpdate(mutation.target.parentElement)
        } else {
          onNodeUpdate(mutation.target)
        }
      }

      clearObsoleteTextNodes()
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
    }
  }, [])

  // Creating convenient data structure //

  const selectionEntries: SelectionEntry[] = useMemo(() => {
    const entries: SelectionEntry[] = []
    for (const node of textNodes) {
      if (node.textContent == null) continue
      if (node.textContent.length === 0) continue

      const rect = getNodeRect(node)
      const box = Box.fromDOMRect(rect)
      const selected = selectionBox.intersects(box)
      const textContent = node.textContent

      entries.push({ box, selected, textContent })
    }
    return entries
  }, [selectionBox, textNodes])
  const selectedEntries = useMemo(() => {
    return selectionEntries.filter(entry => entry.selected)
  }, [selectionEntries])

  return (
    <>
      <SelectionBox {...props} {...{ selectionBox, selectedEntries, selectionEntries, pointerDown }} />
      <SelectedEntriesWindow {...props} {...{ selectionBox, selectedEntries }} />
    </>
  )
}

export default TextSelection
