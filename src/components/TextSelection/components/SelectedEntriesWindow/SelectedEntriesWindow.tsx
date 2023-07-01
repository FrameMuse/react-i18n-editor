import "./SelectedEntriesWindow.scss"

import Box from "geometry/Box"
import { modifiedClass } from "utils/react"

import SelectedEntries, { SelectedEntriesProps } from "./SelectedEntries"


interface SelectedEntriesWindowProps extends SelectedEntriesProps {
  selecting: boolean
  selectionBox: Box

  display?: boolean
}

function SelectedEntriesWindow(props: SelectedEntriesWindowProps) {
  const selectedEntriesModifiers: string[] = []
  if (props.selecting) selectedEntriesModifiers.push("selecting")
  if (!props.display || props.nodesSelected.length === 0) selectedEntriesModifiers.push("hidden")

  const style = {
    "--left": props.selectionBox.center.x,
    "--top": props.selectionBox.center.y
  }

  return (
    <div className={modifiedClass("selected-entries-window", ...selectedEntriesModifiers)} style={style}>
      <SelectedEntries {...props} />
    </div>
  )
}

export default SelectedEntriesWindow
