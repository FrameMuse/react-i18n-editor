import { ReactNode, useEffect, useMemo, useRef, useState } from "react"
import { useEvent } from "react-use"
import { mapSet } from "utils/common"
import TextNode from "utils/TextNode"

import Box from "../../geometry/Box"
import Point from "../../geometry/Point"
import selectionContext, { TextSelectionContext } from "./selectionContext"
import TextSelectionNode from "./TextSelectionNode"

export interface TextSelectionProviderProps {
  root: Node

  children: ReactNode
}

function TextSelectionProvider(props: TextSelectionProviderProps) {
  // Calculating selection box //

  const [selecting, setSelecting] = useState(false)
  const [selectionBox, setSelectionBox] = useState<Box>(Box.NULL)

  const selectionStartRef = useRef<Point>(Point.NULL)
  const selectionEndRef = useRef<Point>(Point.NULL)

  useEvent("pointerdown", (event: PointerEvent) => {
    if (!event.ctrlKey) return
    event.preventDefault()

    selectionStartRef.current = new Point(event.pageX, event.pageY)
    setSelecting(true)
  }, props.root as unknown as null)
  useEvent("pointerup", (event: PointerEvent) => {
    // Set `selecting` to false no matter what.
    setSelecting(false)

    if (!selecting) return
    if (!event.ctrlKey) return
    event.preventDefault()

    // Allow "click" ("up" event immediately after "down" event).
    selectionEndRef.current = new Point(event.pageX, event.pageY)
    setSelectionBox(Box.fromPoints(selectionStartRef.current, selectionEndRef.current))
  })
  useEvent("pointermove", (event: PointerEvent) => {
    if (!selecting) return
    if (!event.ctrlKey) return
    if (event.pressure < 0.5) return
    event.preventDefault()

    selectionEndRef.current = new Point(event.pageX, event.pageY)
    setSelectionBox(Box.fromPoints(selectionStartRef.current, selectionEndRef.current))
  }, props.root as unknown as null)

  // Watching for text nodes //

  const [textNodes, setTextNodes] = useState<Set<Node>>(new Set)
  /**
   * Force update of current nodes. Rewrites the same value.
   *
   * Supposed be used if there is only a node modification (not adding nor deleting).
   */
  const refreshTextNodes = () => setTextNodes(current => new Set(current))

  useEffect(() => {
    // Initial update.
    setTextNodes(new Set(TextNode.findAllIn(props.root)))

    const mutationObserver = new MutationObserver(mutations => {
      setTextNodes(oldTextNodes => {
        const newTextNodes = new Set(oldTextNodes)

        for (const mutation of mutations) {
          if (mutation.type !== "childList") continue

          TextNode.traverseAll(mutation.addedNodes, node => newTextNodes.add(node))
          TextNode.traverseAll(mutation.removedNodes, node => newTextNodes.delete(node))
        }

        return newTextNodes
      })
    })

    mutationObserver.observe(props.root, {
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
  }, [props.root])

  // Watching for user interaction //

  // Watching for size change.
  useEffect(() => {
    const parentElement = props.root.parentElement
    if (parentElement == null) return

    const resizeObserver = new ResizeObserver(refreshTextNodes)

    resizeObserver.observe(parentElement)
    return () => {
      resizeObserver.disconnect()
    }
  }, [props.root])
  // Watching for scroll change.
  useEvent("scroll", refreshTextNodes)
  // Watching for `Control` press (force update).
  useEvent("keydown", (event: KeyboardEvent) => {
    if (!event.ctrlKey) return
    event.preventDefault()

    refreshTextNodes()
  }, props.root as unknown as null)

  // Creating convenient data structure //

  const selectionNodes: TextSelectionNode[] = useMemo(() => {
    return mapSet(textNodes, textNode => {
      return new TextSelectionNode(textNode, selectionBox, props.root)
    })
  }, [selectionBox, textNodes, props.root])
  const selectedNodes: TextSelectionNode[] = useMemo(() => {
    return selectionNodes.filter(node => node.selected)
  }, [selectionNodes])



  const context: TextSelectionContext = {
    box: selectionBox,
    nodes: selectionNodes,
    nodesSelected: selectedNodes,
    selecting
  }

  return (
    <selectionContext.Provider value={context}>
      {props.children}
    </selectionContext.Provider>
  )
}

export default TextSelectionProvider
