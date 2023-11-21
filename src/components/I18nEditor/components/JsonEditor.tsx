import MonacoEditor, { Monaco, OnMount } from "@monaco-editor/react"
import { startCase } from "lodash"
import { editor, IRange } from "monaco-editor/esm/vs/editor/editor.api"

import JsonModel from "@/JsonModel"
import Enum from "@/utils/Enum"

export enum JsonEditorCodeActionKind {
  ScrollIntoView
}

interface JsonEditorProps {
  width?: string
  content: string
  onMount?: OnMount
  onChange?(content: string): void

  /**
   * Triggers on a symbol (field) click.
   */
  onSymbolClick?(range: IRange): void
  /**
   * Triggers when "Scroll into view" is chosen in Code Actions.
   */
  onScrollIntoView?(range: IRange): boolean
}

function JsonEditor(props: JsonEditorProps) {
  function onChange(value: string | undefined) {
    if (value == null) return

    props.onChange?.(value)
  }

  function onMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
    props.onMount?.(editor, monaco)

    // Providers.
    registerSymbolClickProvider(monaco)
    registerCodeActionsProvider(monaco)

    // Commands.
    registerScrollIntoViewCommand(monaco)
  }


  function registerScrollIntoViewCommand(monaco: Monaco) {
    monaco.editor.registerCommand("ScrollIntoView", (_accessor, range: IRange) => {
      props.onScrollIntoView?.(range)
    })
  }


  /**
   * Registers Link Provider (Link request for Symbol click).
   */
  function registerSymbolClickProvider(monaco: Monaco) {
    monaco.languages.registerLinkProvider("json", {
      provideLinks(model) {
        return {
          links: JsonModel.findMatches(model).map(match => {
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

  /**
   * Registers Code Actions.
   */
  function registerCodeActionsProvider(monaco: Monaco) {
    monaco.languages.registerCodeActionProvider("json", {
      provideCodeActions(model, range) {
        const value = model.getValueInRange(range)
        if (!JsonModel.isSymbol(value)) return null

        return {
          dispose() {},
          actions: Enum.keys(JsonEditorCodeActionKind).map(kind => ({
            title: startCase(kind),
            kind,

            command: {
              id: kind,
              title: startCase(kind)
            }
          }))
        }
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
      options={{ smoothScrolling: true, fixedOverflowWidgets: true }}

      onMount={onMount}
      onChange={onChange} />
  )
}

export default JsonEditor
