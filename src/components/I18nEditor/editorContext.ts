import JsonModel, { JsonModelSymbol } from "JsonModel"
import KeyChain from "KeyChain"
import { IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { createContext } from "react"
import { JsonValue } from "type-fest"

import { Resource, Resources } from "./types"

export interface EditorContext {
  root: Element

  jsonModel: JsonModel
  selectedSymbol: JsonModelSymbol | null

  language: string
  languages: string[]
  updateLanguage(language: string): void


  resource: Resource
  resources: Resources
  /**
   * If `language` is not specified current language will be used.
   */
  updateResource(value: Resource, language?: string): void
  /**
   * If `language` is not specified current language will be used.
   */
  updateResourceAt(keyChain: KeyChain, value: JsonValue, language?: string): void


  select(range: IRange): void
  highlight(range: IRange): void
}

const editorContext = createContext<EditorContext | null>(null)
export default editorContext
