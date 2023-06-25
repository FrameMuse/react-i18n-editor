import "./SelectedEntries.scss"

import TextSelectionNode from "components/TextSelection/TextSelectionNode"
import JsonModel, { JsonModelSymbol } from "JsonModel"
import { IRange } from "monaco-editor/esm/vs/editor/editor.api"
import { useMemo, useState } from "react"
import Checkbox from "ui/Checkbox/Checkbox"
import Field from "ui/Field/Field"


export interface SelectedEntriesProps {
  jsonModel: JsonModel
  nodesSelected: TextSelectionNode[]

  onHighlight?(range: IRange): void
  onSelect?(range: IRange): void

  display?: boolean
  onDisplayChange?(value: boolean): void
}

function SelectedEntries(props: SelectedEntriesProps) {
  const [search, setSearch] = useState<string | null>(null)

  const entries: { node: TextSelectionNode; symbols: JsonModelSymbol[] }[] = useMemo(() => {
    return props.nodesSelected.map(node => ({
      node,
      symbols: props.jsonModel.findAllByValue(node.textContent)
    }))
  }, [props.nodesSelected, props.jsonModel])
  const entriesFiltered = useMemo(() => {
    return entries.filter(entry => {
      if (search == null) return true

      try {
        const searchRegExp = new RegExp(search)
        return searchRegExp.test(entry.node.textContent)
      } catch (error) {
        return true
      }
    })
  }, [entries, search])

  const HIDDEN_ENTRIES_AMOUNT = props.nodesSelected.length - entriesFiltered.length

  return (
    <div className="selected-entries">
      <div className="selected-entries__header">
        <div className="selected-entries__title">
          {props.nodesSelected.length} entries selected
        </div>
        <div className="selected-entries__settings">
          <Checkbox checked={props.display} onChange={props.onDisplayChange} />
        </div>
      </div>
      <div className="selected-entries__filters">
        <Field placeholder="Search & Filter" onChange={event => setSearch(event.currentTarget.value)} />
      </div>
      <div className="selected-entries__filtered">
        <span>
          {HIDDEN_ENTRIES_AMOUNT} entries hidden
        </span>
      </div>
      <div className="selected-entries__groups">
        {entriesFiltered.map(({ node, symbols }, index) => (
          <div className="selected-entries-group" key={index}>
            <div className="selected-entries-group__title">{`"${node.textContent}"`}</div>
            <div className="selected-entries-group__matches">
              {symbols.map((symbol, index) => (
                <div className="selected-entries-match" key={index}>
                  <div className="selected-entries-match__number">{index + 1}.</div>
                  <div className="selected-entries-match__keys">
                    {symbol.keyChain.keys.map((key, index) => (
                      <button className="selected-entries-match__key" type="button" onClick={() => props.onHighlight?.(symbol.range)} key={index}>
                        {`"${key}"`}
                      </button>
                    ))}
                  </div>
                  <div className="selected-entries-match__buttons">
                    <button className="selected-entries-match__button" onClick={() => props.onHighlight?.(symbol.range)}>👀</button>
                    <button className="selected-entries-match__button" onClick={() => props.onSelect?.(symbol.range)}>📄</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SelectedEntries
