import { useRef } from "react"

import useResize from "@/hooks/useResize"
import { modifiedClass } from "@/utils/react"

import I18nEditor, { I18nEditorProps } from "./I18nEditor"

interface I18nEditorWindowProps extends Omit<I18nEditorProps, "editorWidth"> {}

function I18nEditorWindow(props: I18nEditorWindowProps) {
  const resizeElementRef = useRef<HTMLDivElement | null>(null)
  const { resizing, width } = useResize(resizeElementRef, { defaultWidth: 500 })

  return (
    <div className={modifiedClass("i18n-editor-window", resizing && "inert")} style={{ "--width": width }}>
      <I18nEditor
        {...props}
        editorWidth={width}
      />
      <div className="i18n-editor-window__resize" ref={resizeElementRef} />
    </div>
  )
}

export default I18nEditorWindow
