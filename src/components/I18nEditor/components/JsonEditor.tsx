import MonacoEditor, { useMonaco } from "@monaco-editor/react"
import { IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { useEffect } from "react"

interface JsonEditorProps {
  width?: string
  content: string

  /**
   * Triggers on a field (symbol) click.
   */
  onSymbolClick?(range: IRange): void
  onChange?(content: string): void
}

function JsonEditor(props: JsonEditorProps) {
  function onChange(value: string | undefined) {
    if (value == null) return

    props.onChange?.(value)
  }

  const monaco = useMonaco()
  // Register Link Provider (Link request for Symbol click).
  useEffect(() => {
    if (monaco == null) return

    const registeredLinkProvider = monaco.languages.registerLinkProvider("json", {
      provideLinks(model) {
        return {
          links: model.findMatches(`".*?"(?=:)`, false, true, false, null, false, 5000).map(match => {
            return {
              range: match.range,
              tooltip: "Open in Comparison Table"
            }
          })
        }
      },
      resolveLink(link) {
        props.onSymbolClick?.(link.range)

        return null
      },
    })
    return () => {
      registeredLinkProvider.dispose()
    }
  }, [monaco])

  return (
    <MonacoEditor
      height="100%"
      width={props.width}

      defaultPath="json-editor"

      language="json"
      defaultLanguage="json"


      value={props.content}
      defaultValue={props.content}

      theme="vs-dark"
      options={{ smoothScrolling: true }}

      onChange={onChange} />
  )
}

export default JsonEditor
