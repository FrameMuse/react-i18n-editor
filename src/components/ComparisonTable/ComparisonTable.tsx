import "./ComparisonTable.scss"

import { JsonModelSymbol } from "JsonModel"
import KeyChain from "KeyChain"
import _ from "lodash"
import { useMemo, useState } from "react"
import { optionsFromKeys } from "ui/Select/Select.helpers"
import SelectMultiple from "ui/Select/SelectMultiple"
import Textarea from "ui/Textarea/Textarea"
import { isRecord } from "utils/common"

export interface ComparisonTableRow {
  keyChain: KeyChain
  values: string[]
}

interface ComparisonTableProps {
  languages: string[]
  resources: Record<string, Record<keyof never, unknown>>

  symbol: JsonModelSymbol | null

  onChange?(language: string, keyChain: KeyChain, value: string): void
  onKeyChainClick?(keyChain: KeyChain): void
}

function ComparisonTable(props: ComparisonTableProps) {
  const [enabledHeadItems, setEnabledHeadItems] = useState(props.languages)
  const enabledHeadItemIndexes = useMemo(() => {
    return props.languages.map((item, index) => enabledHeadItems.includes(item) ? index : -1)
  }, [props.languages])

  const rows: ComparisonTableRow[] = useMemo(() => {
    if (props.symbol == null) return []

    const symbol = props.symbol

    function getKeysChains(): KeyChain[] {

      if (isRecord(symbol.value)) {
        return Object.keys(symbol.value).map(key => new KeyChain([...symbol.keyChain.keys, key]))
      }

      if (symbol.value instanceof Array) {
        return Object.keys(symbol.value).map(key => new KeyChain([...symbol.keyChain.keys, key]))
      }

      return [symbol.keyChain]
    }

    const keysChains = getKeysChains()

    const rows: ComparisonTableRow[] = keysChains.map(keyChain => ({
      keyChain,
      values: props.languages.map(language => _.result(props.resources[language], keyChain.keys, ""))
    }))

    return rows
  }, [props.languages, props.resources, props.symbol])

  return (
    <div className="comparison-table">
      <SelectMultiple width="10em" defaultValue={enabledHeadItems} onChange={setEnabledHeadItems}>
        {optionsFromKeys(props.languages)}
      </SelectMultiple>

      <br />

      <table>
        <thead>
          <tr>
            <th>Key</th>
            {enabledHeadItems.map((item, index) => (
              <th key={index}>{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ keyChain, values }) => (
            <tr key={keyChain.serialized}>
              <th>
                <button type="button" onClick={() => props.onKeyChainClick?.(keyChain)}>{keyChain.serialized}</button>
              </th>
              {values.map((value, index) => enabledHeadItemIndexes.includes(index) && (
                <td key={index}>
                  <Textarea
                    value={value}
                    onChange={event => props.onChange?.(props.languages[index], keyChain, event.currentTarget.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ComparisonTable
