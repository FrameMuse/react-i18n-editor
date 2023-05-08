import Box from "geometry/Box"
import Point from "geometry/Point"
import _ from "lodash"
import { IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { useEffect, useMemo, useRef, useState } from "react"
import { useEvent } from "react-use"

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
  // Calculating selection box //

  const [pointerDown, setPointerDown] = useState(false)
  const [selectionBox, setSelectionBox] = useState<Box>(Box.NULL)

  const selectionStartRef = useRef<Point>(Point.NULL)
  const selectionEndRef = useRef<Point>(Point.NULL)

  useEvent("pointerdown", (event: PointerEvent) => {
    if (!event.ctrlKey) return
    if (excludedContains(event.target)) return

    event.preventDefault()

    selectionStartRef.current = Point.fromPointLike(event)
    setPointerDown(true)
  })
  useEvent("pointerup", (event: PointerEvent) => {
    // Allow "click" ("up" event immediately after "down" event).
    if (event.ctrlKey) {
      event.preventDefault()

      selectionEndRef.current = Point.fromPointLike(event)
      setSelectionBox(Box.fromPoints(selectionStartRef.current, selectionEndRef.current))
    }

    setPointerDown(false)
  })
  useEvent("pointermove", (event: PointerEvent) => {
    if (!event.ctrlKey) return
    if (event.pressure < 0.5) return
    if (excludedContains(event.target)) return

    event.preventDefault()

    selectionEndRef.current = Point.fromPointLike(event)
    setSelectionBox(Box.fromPoints(selectionStartRef.current, selectionEndRef.current))
  })

  // Getting text nodes //

  const [textNodes, setTextNodes] = useState<Set<Node>>(new Set)

  useEffect(() => {
    // TODO: Probably move `rootElement` to context or props.
    const rootElement = document.getElementById("root")
    if (rootElement == null) {
      throw new Error("No #root element found.")
    }
    // Initial update.
    setTextNodes(new Set(getTextNodes(rootElement)))


    const mutationObserver = new MutationObserver(mutations => {
      const addedTextNodes: Node[] = []
      const removedTextNodes: Node[] = []
      let textNodesModified = false

      for (const mutation of mutations) {
        if (excludedContains(mutation.target)) continue

        if (mutation.type === "childList") {
          addedTextNodes.push(...[...mutation.addedNodes].flatMap(getTextNodes))
          removedTextNodes.push(...[...mutation.removedNodes].flatMap(getTextNodes))

          continue
        }

        textNodesModified = true
      }

      setTextNodes(oldTextNodes => {
        const newTextNodes = new Set(oldTextNodes)

        removedTextNodes.forEach(node => newTextNodes.delete(node))
        addedTextNodes.forEach(node => newTextNodes.add(node))

        if (textNodesModified) {
          return newTextNodes
        }


        if (_.difference([...newTextNodes], [...oldTextNodes]).length === 0)
          if (_.difference([...oldTextNodes], [...newTextNodes]).length === 0) {
            return oldTextNodes
          }

        return newTextNodes
      })
    })

    mutationObserver.observe(rootElement, {
      attributes: true,
      attributeOldValue: true,

      characterData: true,
      characterDataOldValue: true,

      childList: true,
      subtree: true
    })

    console.log(1)

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
      <SelectionBox {...props} {...{ selectionBox, selectedEntries, selectionEntries }} selecting={pointerDown} />
      <SelectedEntriesWindow {...props} {...{ selectionBox, selectedEntries }} selecting={pointerDown} />
    </>
  )
}

export default TextSelection
