import "./ComparisonTable.scss"

import { JsonModelSymbol } from "JsonModel"
import KeyChain from "KeyChain"
import { result } from "lodash"
import { useMemo, useState } from "react"
import { optionsFromKeys } from "ui/Select/Select.helpers"
import SelectMultiple from "ui/Select/SelectMultiple"
import Textarea from "ui/Textarea/Textarea"

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
  const [enabledLanguages, setEnabledLanguages] = useState(props.languages)

  const rows: ComparisonTableRow[] = useMemo(() => {
    if (props.symbol == null) return []

    const childrenKeysChains = KeyChain.getChildrenKeysChains(props.symbol.value, props.symbol.atKeyChain)

    const rows: ComparisonTableRow[] = childrenKeysChains.map(keyChain => ({
      keyChain,
      values: props.languages.map(language => result(props.resources[language], keyChain.keys, ""))
    }))
    return rows
  }, [props.languages, props.resources, props.symbol])

  return (
    <div className="comparison-table">
      <SelectMultiple width="10em" defaultValue={enabledLanguages} onChange={setEnabledLanguages}>
        {optionsFromKeys(props.languages)}
      </SelectMultiple>

      <br />

      <table>
        <thead>
          <tr>
            <th>Key</th>
            {enabledLanguages.map((item, index) => (
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
              {values.map((value, index) => enabledLanguages.includes(props.languages[index]) && (
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
