import selectionContext from "components/TextSelection/selectionContext"
import useSafeContext from "hooks/useSafeContext"
import { useMemo } from "react"

import SelectionBox from "./SelectionBox"

function SelectionBoxContainer() {
  const selection = useSafeContext(selectionContext)

  const hidden = !selection.selecting && selection.nodesSelected.length === 0
  // Spread an entry with multiple boxes to separate entries with single box.
  const nodes = useMemo(() => {
    return selection.nodes.flatMap(node => node.flat())
  }, [selection.nodes])

  return (
    <SelectionBox selectionBox={selection.box} nodes={nodes} hidden={hidden} />
  )
}

export default SelectionBoxContainer
