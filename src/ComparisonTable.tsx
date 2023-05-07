import "./ComparisonTable.scss"

import { useState } from "react"
import { optionsFromKeys } from "Select/Select.helpers"
import SelectMultiple from "Select/SelectMultiple"
import Textarea from "Textarea/Textarea"

export type ComparisonTableRow = [Key: string, ...Values: string[]]

interface ComparisonTableProps {
  head: string[]
  body: ComparisonTableRow[]

  onChange?(key: string, index: number, value: string): void
}

function ComparisonTable(props: ComparisonTableProps) {
  const [enabledHeadItems, setEnabledHeadItems] = useState(props.head)
  const enabledHeadItemIndexes = props.head.map((item, index) => enabledHeadItems.includes(item) ? index : -1)

  return (
    <div className="comparison-table">
      <SelectMultiple width="10em" defaultValue={enabledHeadItems} onChange={setEnabledHeadItems}>
        {optionsFromKeys(props.head)}
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
          {props.body.map(([key, ...values]) => (
            <tr key={key}>
              <th>{key}</th>
              {values.map((value, index) => enabledHeadItemIndexes.includes(index) && (
                <td key={index}>
                  <Textarea defaultValue={value} onChange={event => props.onChange?.(key, index, event.currentTarget.value)} />
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
