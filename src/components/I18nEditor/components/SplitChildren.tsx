import { ReactNode, useState } from "react"

interface SplitChildrenProps {
  baseChildren: ReactNode
  children(element: HTMLDivElement): ReactNode
}

/**
 * [Read more here](https://github.com/FrameMuse/react-i18next-editor/issues/30)
 */
function SplitChildren(props: SplitChildrenProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null)

  return (
    <>
      <div style={{ all: "inherit" }} ref={setRoot}>
        {props.baseChildren}
      </div>
      {root && props.children(root)}
    </>
  )
}

export default SplitChildren
