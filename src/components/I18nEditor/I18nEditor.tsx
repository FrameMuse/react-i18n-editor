import "./I18nEditor.scss"

import { OnMount } from "@monaco-editor/react"
import ComparisonTableContainer from "components/ComparisonTable/ComparisonTableContainer"
import SelectedEntriesContainer from "components/TextSelection/components/SelectedEntriesWindow/SelectedEntriesContainer"
import useSafeContext from "hooks/useSafeContext"
import { startCase } from "lodash"
import Select from "ui/Select/Select"
import { optionsFromKeys } from "ui/Select/Select.helpers"
import TabLink from "ui/TabRouter/TabLink"
import TabRoute from "ui/TabRouter/TabRoute"
import Enum from "utils/Enum"

import JsonEditor from "./components/JsonEditor"
import editorContext from "./editorContext"
import { I18nEditorTabs } from "./types"

export interface I18nEditorProps {
  editorWidth: number
  onEditorMount?: OnMount
  onEditorChange?(content: string): void
}

function I18nEditor(props: I18nEditorProps) {
  const editor = useSafeContext(editorContext)

  return (
    <div className="i18n-editor">
      <div className="i18n-editor__settings">
        <Select width={editor.language.length + "ch"} defaultValue={editor.language} onChange={editor.updateLanguage}>
          {optionsFromKeys(editor.languages, true)}
        </Select>
      </div>
      <div className="i18n-editor__tabs">
        {Enum.keys(I18nEditorTabs).map(tab => (
          <TabLink className="i18n-editor__tab" to={I18nEditorTabs[tab as never]} key={tab}>
            {startCase(tab)}
          </TabLink>
        ))}
      </div>
      <div className="i18n-editor__container">
        <TabRoute path={I18nEditorTabs.ResourceEditor}>
          <JsonEditor
            width={props.editorWidth + "px"}
            content={editor.jsonModel.valueSerialized}

            onMount={props.onEditorMount}
            onChange={props.onEditorChange}

            onSymbolClick={editor.select}
          />
        </TabRoute>
        <TabRoute path={I18nEditorTabs.ComparisonTable}>
          <ComparisonTableContainer />
        </TabRoute>
        <TabRoute path={I18nEditorTabs.SelectedEntries}>
          <div style={{ margin: "1.5em" }}>
            <SelectedEntriesContainer />
          </div>
        </TabRoute>
      </div>
    </div>
  )
}

export default I18nEditor
