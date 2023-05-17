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

import "./I18nEditor.scss"

import ComparisonTable from "components/ComparisonTable/ComparisonTable"
import useResize from "hooks/useResize"
import { InitOptions } from "i18next"
import _ from "lodash"
import { IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { ReactElement, ReactNode, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import Select from "ui/Select/Select"
import { optionsFromKeys } from "ui/Select/Select.helpers"
import TabLink from "ui/TabRouter/TabLink"
import TabRoute from "ui/TabRouter/TabRoute"
import TabRouter from "ui/TabRouter/TabRouter"
import { useTabRouter } from "ui/TabRouter/tabRouterContext"
import Enum from "utils/Enum"
import { modifiedClass } from "utils/react"

import useMonacoHighlightInRange from "../../hooks/useMonacoHighlightInRange"
import JsonModel, { JsonModelSymbol } from "../../JsonModel"
import KeyChain from "../../KeyChain"
import TextSelection from "../../TextSelection/TextSelection"
import JsonEditor from "./components/JsonEditor"
import SplitChildren from "./components/SplitChildren"


export const I18N_EDITOR_REFRESH_EVENT = "i18n-editor-refresh"

type Resources = Record<string, Record<keyof never, unknown>>

interface I18nEditorContainerProps {
  root: Element
}
type I18nEditorContainer = (props: I18nEditorContainerProps) => ReactElement

interface I18nEditorBoundaryProps {
  children: ReactNode
  container: I18nEditorContainer
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function I18nEditorBoundary(props: I18nEditorBoundaryProps) {
  return (
    <SplitChildren baseChildren={props.children}>
      {baseChildrenContainer => (
        <TabRouter defaultPath={Tabs.ResourceEditor}>
          <props.container root={baseChildrenContainer} />
        </TabRouter>
      )}
    </SplitChildren>
  )
}


interface I18nextEditorContainerProps extends I18nEditorContainerProps {}

export function I18nextEditorContainer(props: I18nextEditorContainerProps) {
  const [, i18n] = useTranslation()

  const [namespace] = useState<string>(resolveNamespace(i18n.options.ns))
  const resources: Resources = useMemo(() => {
    // Extract language namespace to fit to `Resources`.
    return _.mapValues(i18n.store.data, resource => {
      return resource[namespace] as Resources
    })
  }, [namespace])

  function onResourceChange(resources: Resources) {
    try {
      // Add language namespace back to fit to `i18next` resource type.
      const resourcesWithNamespace = _.mapValues(resources, resource => ({ [namespace]: resource }))

      i18n.store.data = resourcesWithNamespace
      i18n.emit(I18N_EDITOR_REFRESH_EVENT)
    } catch (error) {
      console.error(error)
    }
  }

  function onLanguageChange(language: string) {
    i18n.changeLanguage(language)
    i18n.emit(I18N_EDITOR_REFRESH_EVENT)
  }

  return (
    <I18nEditor
      root={props.root}

      defaultLanguage={i18n.language}
      languages={Object.keys(i18n.store.data)}
      onLanguageChange={onLanguageChange}

      resources={resources}
      onResourcesChange={onResourceChange}
    />
  )
}



export enum Tabs {
  ResourceEditor,
  ComparisonTable
}

interface I18nEditorProps {
  root: Element


  languages: string[]
  defaultLanguage?: string
  onLanguageChange?(language: string): void

  resources: Resources
  /**
   * Note that new `resource` is cloned object and given `resource` is not being modified.
  */
  onResourcesChange?(resources: Resources): void
}

function I18nEditor(props: I18nEditorProps) {
  const highlightInRange = useMonacoHighlightInRange()
  const [, setTab] = useTabRouter()

  const [language, setLanguage] = useState<string>(props.defaultLanguage ?? props.languages[0])
  const [resources, setResources] = useState(props.resources)

  const resource: Resources[string] = useMemo(() => resources[language], [resources, language])
  const resourceSerialized: string = useMemo(() => JSON.stringify(resource, null, 2), [resource])


  const jsonSymbols: JsonModel = useMemo(() => {
    return JsonModel.fromSerialized(resourceSerialized)
  }, [resourceSerialized])
  const [selectedSymbol, setSelectedSymbol] = useState<JsonModelSymbol | null>(null)

  // This is a hack for `jsonSymbols`.
  const jsonSymbolsRef = useRef(jsonSymbols)
  jsonSymbolsRef.current = jsonSymbols


  function updateLanguage(language: string) {
    setLanguage(language)
    props.onLanguageChange?.(language)
  }

  function updateResource(newResource: Resources[string], forLanguage: string = language) {
    const newResources = { ...resources, [forLanguage]: newResource }

    setResources(newResources)
    props.onResourcesChange?.(newResources)
  }

  function onEditorContentChange(value: string) {
    try {
      const newResource = JSON.parse(value)

      updateResource(newResource)
    } catch (error) {
      console.error(error)
    }
  }

  function onCompare(range: IRange) {
    setTab(Tabs.ComparisonTable)

    const symbol = jsonSymbolsRef.current.findInRange(range)
    setSelectedSymbol(symbol)
  }

  function onHighlight(range: IRange) {
    setTab(Tabs.ResourceEditor)
    highlightInRange(range)
  }

  function onTableChange(language: string, keyChain: KeyChain, value: string) {
    const specificResource = resources[language]
    const newResource = _.setWith(specificResource, keyChain.keys, value)

    updateResource(newResource, language)
  }

  function onTableKeyChainClick(keyChain: KeyChain) {
    const symbol = jsonSymbolsRef.current.getByKeyChain(keyChain)
    onHighlight(symbol.range)
  }

  const resizeElementRef = useRef<HTMLDivElement | null>(null)
  const { resizing, width } = useResize(resizeElementRef, { defaultWidth: 500 })


  return (
    <>
      <TextSelection
        root={props.root}
        jsonModel={jsonSymbols}

        onHighlight={onHighlight}
        onCompare={onCompare}
      />
      <div className={modifiedClass("i18n-editor-window", resizing && "inert")} style={{ "--width": width }}>
        <div className="i18n-editor">
          <div className="i18n-editor__settings">
            <Select width={language.length + "ch"} defaultValue={language} onChange={updateLanguage}>
              {optionsFromKeys(props.languages, true)}
            </Select>
          </div>
          <div className="i18n-editor__tabs">
            {Enum.keys(Tabs).map(tab => (
              <TabLink className="i18n-editor__tab" to={Tabs[tab as never]} key={tab}>{_.startCase(tab)}</TabLink>
            ))}
          </div>
          <div className="i18n-editor__container">
            <TabRoute path={Tabs.ResourceEditor}>
              <JsonEditor width={width + "px"} content={resourceSerialized} onChange={onEditorContentChange} onSymbolClick={onCompare} />
            </TabRoute>
            <TabRoute path={Tabs.ComparisonTable}>
              <ComparisonTable
                languages={props.languages}
                resources={resources}

                symbol={selectedSymbol}

                onChange={onTableChange}
                onKeyChainClick={onTableKeyChainClick}
              />
            </TabRoute>
          </div>
          <div className="i18n-editor-window__resize" ref={resizeElementRef} />
        </div>
      </div>
    </>
  )
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

export default I18nEditorBoundary
