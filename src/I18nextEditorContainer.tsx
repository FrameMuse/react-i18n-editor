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

import "./I18nextEditorContainer.scss"

import { useMonaco } from "@monaco-editor/react"
import { InitOptions } from "i18next"
import _ from "lodash"
import { editor, IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useEvent } from "react-use"
import { useTabRouter } from "TabRouter/tabRouterContext"
import TextSelection from "TextSelection"

import ComparisonTable, { ComparisonTableRow } from "./ComparisonTable"
import Enum from "./enum"
import RangedEntries from "./RangedEntries"
import ResourceEditor from "./ResourceEditor"
import Select from "./Select/Select"
import { optionsFromKeys } from "./Select/Select.helpers"
import TabLink from "./TabRouter/TabLink"
import TabRoute from "./TabRouter/TabRoute"
import TabRouter from "./TabRouter/TabRouter"
import { classWithModifiers, isRecord } from "./utils"

const DEFAULT_RANGED_ENTRIES = new RangedEntries({}, editor.createModel(""))

export enum Tabs {
  ResourceEditor,
  ComparisonTable
}

interface I18nextEditorContainerProps {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function I18nextEditorContainer(props: I18nextEditorContainerProps) {
  return (
    <TabRouter defaultPath={Tabs.ResourceEditor}>
      <I18nextEditorWindow />
    </TabRouter>
  )
}

function I18nextEditorWindow() {
  const [, setTab] = useTabRouter()

  const [, i18n] = useTranslation()

  const [language, setLanguage] = useState<string>(i18n.language)
  const languages = Object.keys(i18n.store.data)

  const [namespace] = useState<string>(resolveNamespace(i18n.options.ns))


  const [content, setContent] = useState<string>("")
  const [tableBody, setTableBody] = useState<ComparisonTableRow[]>([])

  const [rangedEntries, setRangedEntries] = useState<RangedEntries>(DEFAULT_RANGED_ENTRIES)
  const rangedEntriesRef = useRef(rangedEntries)
  rangedEntriesRef.current = rangedEntries

  function onCompareRequest(range: IRange) {
    setTab(Tabs.ComparisonTable)

    const entry = rangedEntriesRef.current.findByRange(range)

    function getKeysChains() {
      const baseKey = entry.keys

      if (isRecord(entry.value)) {
        return Object.keys(entry.value).map(key => [...baseKey, key].join("."))
      }

      if (entry.value instanceof Array) {
        return Object.keys(entry.value).map(key => [...baseKey, key].join("."))
      }

      return [baseKey.join(".")]
    }

    const keysChains = getKeysChains()

    const rows: ComparisonTableRow[] = keysChains.map(keysChain => [keysChain, ...languages.map(lang => {
      return String(i18n.getResource(lang, namespace, keysChain) ?? "")
    })])

    setTableBody(rows)
  }

  function onContentChange(value: string) {
    try {
      i18n.store.data[language][namespace] = JSON.parse(value)
      i18n.emit("react-refresh")

      setContent(value)
    } catch (error) {
      console.error(error)
    }
  }

  function onTableChange(key: string, index: number, value: string) {
    const currentLanguage = languages[index]
    const resourceKey = getResourceKey(currentLanguage, namespace)

    setByKeys(value, resourceKey, key.replace(/\[|\]/g, "").split("."))

    i18n.emit("react-refresh")
  }

  function getResourceKey(language: string, namespace: string) {
    const resourceKey = i18n.store.data[language][namespace]
    if (typeof resourceKey === "string") {
      throw new Error("The resource structure can't be a string.")
    }

    return resourceKey
  }

  const highlightDecorationsCollectionRef = useRef<editor.IEditorDecorationsCollection | null>(null)

  function onResourceEditorLook(range: IRange) {
    if (monaco == null) return

    setTab(Tabs.ResourceEditor)

    const EEditor = monaco.editor.getEditors()[0]
    setTimeout(() => {
      EEditor.revealRangeInCenter(range, editor.ScrollType.Smooth)
    })

    if (highlightDecorationsCollectionRef.current != null) {
      highlightDecorationsCollectionRef.current.clear()
    }

    const decorationsCollection = EEditor.createDecorationsCollection([{
      options: {
        isWholeLine: true,
        className: "peep"
      },
      range
    }])

    highlightDecorationsCollectionRef.current = decorationsCollection
  }

  const monaco = useMonaco()
  useEffect(() => {
    if (monaco == null) return

    const EEditor = monaco.editor.getEditors()[0]

    const model = EEditor.getModel()
    if (model == null) return

    const resourceKey = getResourceKey(language, namespace)

    setRangedEntries(
      new RangedEntries(resourceKey, model)
    )
  }, [monaco, language, namespace, content])

  // Serializes ResourceKey.
  useEffect(() => {
    try {
      const resourceKey = i18n.store.data[language][namespace]
      const resourceKeySerialized = JSON.stringify(resourceKey, null, 2)

      setContent(resourceKeySerialized)
    } catch (error) {
      console.error(error)
    }
  }, [language, namespace])

  useEffect(() => {
    i18n.changeLanguage(language)
    i18n.setDefaultNamespace(namespace)

    i18n.emit("react-refresh")
  }, [language, namespace])






  const expanderElementRef = useRef<HTMLDivElement | null>(null)

  const [resizing, setResizing] = useState(false)
  const [width, setWidth] = useState(500)

  const [expandedStartX, setExpandedStartX] = useState(0)
  const [expandedEndX, setExpandedEndX] = useState(width)

  useEvent("mousedown", (event: MouseEvent) => {
    event.preventDefault()

    setResizing(true)
    setExpandedStartX(event.x)
  }, expanderElementRef.current as null)
  useEvent("mouseup", (event: MouseEvent) => {
    event.preventDefault()

    setResizing(false)
    setExpandedEndX(width)
  })
  useEvent("mousemove", (event: MouseEvent) => {
    if (!resizing) return

    event.preventDefault()

    setWidth(expandedEndX + expandedStartX - event.x)
  })

  return (
    <>
      <TextSelection rangedEntries={rangedEntries} onResourceEditorLook={onResourceEditorLook} onCompareRequest={onCompareRequest} />
      <div className={classWithModifiers("i18n-editor", resizing && "expanding")} style={{ "--width": width }}>
        <div className="i18n-editor__tabs">
          {Enum.keys(Tabs).map(tab => (
            <TabLink className="i18n-editor__tab" to={Tabs[tab as never]} key={tab}>{_.startCase(tab)}</TabLink>
          ))}
        </div>
        <div className="i18n-editor__settings">
          <Select width={language.length + "ch"} defaultValue={language} onChange={setLanguage}>
            {optionsFromKeys(languages, true)}
          </Select>
        </div>
        <div className="i18n-editor__container">
          <TabRoute path={Tabs.ResourceEditor}>
            <ResourceEditor width={width + "px"} content={content} onChange={onContentChange} onCompareRequest={onCompareRequest} />
          </TabRoute>
          <TabRoute path={Tabs.ComparisonTable}>
            <ComparisonTable head={languages} body={tableBody} onChange={onTableChange} />
          </TabRoute>
        </div>
        <div className="i18n-editor__expander" ref={expanderElementRef} />
      </div>
    </>
  )
}

function setByKeys(value: unknown, object: Record<keyof never, unknown>, keys: string[]) {
  if (keys.length > 1) {
    setByKeys(value, object[keys[0]] as never, keys.slice(1))
    return
  }

  object[keys[0]] = value
}

function resolveNamespace(namespace: InitOptions["ns"]): string {
  if (namespace == null) {
    return "translation"
  }

  if (namespace instanceof Array) {
    return namespace[0]
  }

  return namespace
}

export default I18nextEditorContainer
