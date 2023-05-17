import { editor, IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { MutableRefObject, useRef } from "react"

function useMonacoHighlightInRange(editorInstanceRef: MutableRefObject<editor.ICodeEditor | null>) {
  const highlightDecorationsCollectionRef = useRef<editor.IEditorDecorationsCollection | null>(null)

  function highlightInRange(range: IRange) {
    if (editorInstanceRef.current == null) return
    const editorInstance = editorInstanceRef.current

    // Reveal after editor rendered.
    setTimeout(() => {
      editorInstance.revealRangeInCenter(range, editor.ScrollType.Smooth)
    })

    if (highlightDecorationsCollectionRef.current != null) {
      highlightDecorationsCollectionRef.current.clear()
    }

    const decorationsCollection = editorInstance.createDecorationsCollection([{
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
