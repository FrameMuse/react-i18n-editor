import "./SelectionBox.scss"

import Box from "geometry/Box"
import { useMemo } from "react"
import { modifiedClass } from "utils/react"

import { TextSelectionEntry } from "../../TextSelection"

interface SelectionBoxProps {
  selectionBox: Box
  selectedEntries: TextSelectionEntry[]
  selectionEntries: TextSelectionEntry[]

  selecting: boolean
}

function SelectionBox(props: SelectionBoxProps) {
  // Hide if nothing is selected.
  const hidden = !props.selecting && props.selectedEntries.length === 0
  // Flatten multiple boxes to single.
  const selectionEntries = useMemo(() => {
    return props.selectionEntries.flatMap(entry => entry.boxes.map(box => ({ ...entry, box })))
  }, [props.selectionEntries])

  return (
    <div className="selection-box">
      <div className="selection-box__entries">
        {selectionEntries.map((entry, index) => (
          <div className={modifiedClass("selection-box__element", entry.selected && "active")} style={{
            "--left": entry.box.startX,
            "--top": entry.box.startY,

            "--width": entry.box.width,
            "--height": entry.box.height,

            zIndex: entry.zIndex,
            visibility: entry.visibility ? "visible" : "hidden"
          }} key={index} />
        ))}
      </div>
      <div className={modifiedClass("selection-box__selection", hidden && "hidden")} style={{
        "--left": props.selectionBox.startX,
        "--top": props.selectionBox.startY,

        "--width": props.selectionBox.width,
        "--height": props.selectionBox.height
      }} />
    </div>
  )
}

export default SelectionBox
