import { useMonaco } from "@monaco-editor/react"
import { editor, IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { useRef } from "react"

function useMonacoHighlightInRange() {
  const monaco = useMonaco()

  const highlightDecorationsCollectionRef = useRef<editor.IEditorDecorationsCollection | null>(null)

  function highlightInRange(range: IRange) {
    if (monaco == null) return

    const EEditor = monaco.editor.getEditors()[0]
    // Reveal after editor rendered.
    setTimeout(() => {
      EEditor.revealRangeInCenter(range, editor.ScrollType.Smooth)
    })

    if (highlightDecorationsCollectionRef.current != null) {
      highlightDecorationsCollectionRef.current.clear()
    }

    const decorationsCollection = EEditor.createDecorationsCollection([{
      options: {
        isWholeLine: true,
        className: "highlight"
      },
      range
    }])

    highlightDecorationsCollectionRef.current = decorationsCollection
  }

  return highlightInRange
}

export default useMonacoHighlightInRange
