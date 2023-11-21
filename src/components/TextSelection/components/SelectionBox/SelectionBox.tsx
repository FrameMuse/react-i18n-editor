import "./SelectionBox.scss"

import { TextSelectionNodeFlatten } from "@/components/TextSelection/TextSelectionNode"
import Box from "@/geometry/Box"
import { modifiedClass } from "@/utils/react"


interface SelectionBoxProps {
  /**
   * Accepts only flatten nodes (single box nodes).
  */
  nodes: TextSelectionNodeFlatten[]
  selectionBox: Box

  hidden?: boolean
}

function SelectionBox(props: SelectionBoxProps) {
  return (
    <div className="selection-box">
      <div className="selection-box__entries">
        {props.nodes.map((node, index) => (
          <div className={modifiedClass("selection-box__element", node.selected && "active")} style={{
            "--left": Math.round(node.box.startX),
            "--top": Math.round(node.box.startY),

            "--width": Math.round(node.box.width),
            "--height": Math.round(node.box.height),

            ...node.styles
          }}

          contentEditable
          spellCheck

          key={index}
          />
        ))}
      </div>
      <div className={modifiedClass("selection-box__selection", props.hidden && "hidden")} style={{
        "--left": props.selectionBox.startX,
        "--top": props.selectionBox.startY,

        "--width": props.selectionBox.width,
        "--height": props.selectionBox.height
      }} />
    </div>
  )
}

export default SelectionBox
