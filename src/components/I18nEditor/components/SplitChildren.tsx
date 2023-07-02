import { ReactNode, useRef } from "react"

interface SplitChildrenProps {
  baseChildren: ReactNode
  children(element: DocumentFragment): ReactNode
}

/**
 * [Read more here](https://github.com/FrameMuse/react-i18next-editor/issues/30)
 */
function SplitChildren(props: SplitChildrenProps) {
  const rootRef = useRef(document.createDocumentFragment())

  function replaceWithFragment(element: HTMLDivElement | null) {
    if (element == null) return

    element.replaceWith(rootRef.current)
  }

  return (
    <>
      {props.baseChildren}
      {props.children(rootRef.current)}
    </>
  )
}

export default SplitChildren
