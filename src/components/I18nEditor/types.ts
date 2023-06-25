import { ReactElement } from "react"

export type Resource = Record<keyof never, unknown>
export type Resources = Record<string, Resource>

export interface I18nEditorOptions {
  /**
   * Keybinding to trigger actions (i.e. selection).
   */
  triggerKey: string
}

export interface I18nEditorMiddlewareProps {
  root: Element
}
export type I18nEditorMiddleware = (props: I18nEditorMiddlewareProps) => ReactElement

export enum I18nEditorTabs {
  ResourceEditor,
  ComparisonTable,
  SelectedEntries
}
