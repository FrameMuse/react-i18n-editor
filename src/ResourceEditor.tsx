import MonacoEditor, { useMonaco } from "@monaco-editor/react"
import { IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { useEffect } from "react"

interface ResourceEditorProps {
  width?: string

  /**
   * This is supposed to be serialized `ResourceKey` (an object structure of a language).
   *
   * This should be either an array or an object, otherwise it might not work properly.
   */
  content: string

  /**
   * A request to open a comparison table.
   */
  onCompareRequest?(range: IRange): void
  onChange?(content: string): void
}

function ResourceEditor(props: ResourceEditorProps) {
  function onChange(value: string | undefined) {
    if (value == null) return

    props.onChange?.(value)
  }

  const monaco = useMonaco()

  // Register Link Provider (Link request for Compare)
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
        props.onCompareRequest?.(link.range)

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

      defaultPath="json-editor"

      language="json"
      defaultLanguage="json"

      width={props.width}

      value={props.content}
      defaultValue={props.content}

      theme="vs-dark"
      options={{ smoothScrolling: true }}

      onChange={onChange} />
  )
}

export default ResourceEditor
