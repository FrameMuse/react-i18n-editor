import MonacoEditor, { Monaco, OnMount } from "@monaco-editor/react"
import { editor, IRange } from "monaco-editor/esm/vs/editor/editor.api"

interface JsonEditorProps {
  width?: string
  content: string

  /**
   * Triggers on a field (symbol) click.
   */
  onSymbolClick?(range: IRange): void
  onChange?(content: string): void

  onMount?: OnMount
}

function JsonEditor(props: JsonEditorProps) {
  function onChange(value: string | undefined) {
    if (value == null) return

    props.onChange?.(value)
  }

  function onMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    props.onMount?.(editor, monaco)
    // Register Link Provider (Link request for Symbol click).
    monaco.languages.registerLinkProvider("json", {
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
      }
    })
  }

  return (
    <MonacoEditor
      height="100%"
      width={props.width}

      path="json-editor"
      defaultPath="json-editor"

      language="json"
      defaultLanguage="json"

      value={props.content}
      defaultValue={props.content}

      theme="vs-dark"
      options={{ smoothScrolling: true }}

      onMount={onMount}
      onChange={onChange} />
  )
}

export default JsonEditor
