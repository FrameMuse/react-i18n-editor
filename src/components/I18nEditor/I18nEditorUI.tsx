/*

MIT License

Copyright (c) 2023 Valery Zinchenko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

*/

import SelectedEntriesWindowContainer from "components/TextSelection/components/SelectedEntriesWindow/SelectedEntriesWindowContainer"
import SelectionBoxContainer from "components/TextSelection/components/SelectionBox/SelectionBoxContainer"
import { setWith } from "lodash"
import { editor, IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { useMemo, useRef, useState } from "react"
import { JsonValue } from "type-fest"
import { useTabRouter } from "ui/TabRouter/tabRouterContext"

import useMonacoHighlightInRange from "../../hooks/useMonacoHighlightInRange"
import JsonModel, { JsonModelSymbol } from "../../JsonModel"
import KeyChain from "../../KeyChain"
import editorContext, { EditorContext } from "./editorContext"
import I18nEditorWindow from "./I18nEditorWindow"
import { I18nEditorTabs, Resource, Resources } from "./types"


export const I18N_EDITOR_REFRESH_EVENT = "i18n-editor-refresh"

interface I18nEditorUIProps {
  root: Node


  languages: string[]
  defaultLanguage?: string
  onLanguageChange?(language: string): void

  resources: Resources
  /**
   * Note that new `resource` is cloned object and given `resource` is not being modified.
  */
  onResourcesChange?(resources: Resources): void
}

function I18nEditorUI(props: I18nEditorUIProps) {
  const jsonEditorInstanceRef = useRef<editor.IStandaloneCodeEditor | null>(null)
  const highlightInRange = useMonacoHighlightInRange(jsonEditorInstanceRef)

  const [, setTab] = useTabRouter()

  const [language, setLanguage] = useState<string>(props.defaultLanguage ?? props.languages[0])
  const [resources, setResources] = useState(props.resources)

  const resource: Resources[string] = useMemo(() => resources[language], [resources, language])
  const resourceSerialized: string = useMemo(() => JSON.stringify(resource, null, 2), [resource])


  const jsonModel: JsonModel = useMemo(() => {
    return JsonModel.fromSerialized(resourceSerialized)
  }, [resourceSerialized])
  const [selectedSymbol, setSelectedSymbol] = useState<JsonModelSymbol | null>(null)

  // This is a hack for `jsonModel`.
  const jsonModelRef = useRef(jsonModel)
  jsonModelRef.current = jsonModel


  function updateLanguage(language: string) {
    setLanguage(language)
    props.onLanguageChange?.(language)
  }

  function updateResource(newResource: Resource, forLanguage: string = language) {
    const newResources = { ...resources, [forLanguage]: newResource }

    setResources(newResources)
    props.onResourcesChange?.(newResources)
  }

  function updateResourceAt(keyChain: KeyChain, value: JsonValue, forLanguage = language) {
    /** Spread syntax to make sure it's a different object for memo. */
    const resource = { ...resources[forLanguage] }
    const newResource = setWith(resource, keyChain.keys, value)

    updateResource(newResource, forLanguage)
  }

  // !!! //
  function onEditorMount(editor: editor.IStandaloneCodeEditor) {
    jsonEditorInstanceRef.current = editor
  }

  // !!! //
  function onEditorChange(value: string) {
    try {
      const newResource = JSON.parse(value)

      updateResource(newResource)
    } catch (error) {
      console.error(error)
    }
  }

  function select(range: IRange) {
    setTab(I18nEditorTabs.ComparisonTable)

    const symbol = jsonModelRef.current.findInRange(range)
    setSelectedSymbol(symbol)
  }

  function highlight(range: IRange) {
    setTab(I18nEditorTabs.ResourceEditor)

    highlightInRange(range)
  }




  const context: EditorContext = {
    root: props.root,

    jsonModel,
    selectedSymbol,

    language,
    languages: props.languages,
    updateLanguage,

    resource,
    resources,
    updateResource,
    updateResourceAt,

    select,
    highlight
  }

  return (
    <editorContext.Provider value={context}>
      <SelectedEntriesWindowContainer />
      <SelectionBoxContainer />

      <I18nEditorWindow
        onEditorMount={onEditorMount}
        onEditorChange={onEditorChange}
      />
    </editorContext.Provider>
  )
}

export default I18nEditorUI
