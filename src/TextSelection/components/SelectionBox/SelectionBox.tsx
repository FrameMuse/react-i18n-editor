import "./SelectionBox.scss"

import Box from "geometry/Box"
import { useMemo } from "react"
import { classWithModifiers } from "utils"

import { SelectionEntry, TextSelectionProps } from "../../TextSelection"

interface SelectionBoxProps extends TextSelectionProps {
  selectionBox: Box
  selectedEntries: SelectionEntry[]
  selectionEntries: SelectionEntry[]

  selecting: boolean
}

function SelectionBox(props: SelectionBoxProps) {
  const selectionModifiers: string[] = useMemo(() => {
    const modifiers: string[] = []

    // Hide if nothing was selected.
    if (!props.selecting && props.selectedEntries.length === 0) {
      modifiers.push("hidden")
    }

    return modifiers
  }, [props.selecting, props.selectedEntries])

  return (
    <div className="selection-box">
      <div className="selection-box__entries">
        {props.selectionEntries.map((entry, index) => (
          <div className={classWithModifiers("selection-box__element", entry.selected && "active")} style={{
            "--left": entry.box.startX,
            "--top": entry.box.startY,

            "--width": entry.box.width,
            "--height": entry.box.height
          }} key={index} />
        ))}
      </div>
      <div className={classWithModifiers("selection-box__selection", ...selectionModifiers)} style={{
        "--left": props.selectionBox.startX,
        "--top": props.selectionBox.startY,

        "--width": props.selectionBox.width,
        "--height": props.selectionBox.height
      }} />
    </div>
  )
}

export default SelectionBox
