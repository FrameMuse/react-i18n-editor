import "./SelectedEntriesWindow.scss"

import Box from "geometry/Box"
import { JsonModelSymbol } from "JsonModel"
import { useMemo } from "react"
import { modifiedClass } from "utils/react"

import { TextSelectionEntry, TextSelectionProps } from "../../TextSelection"

interface SelectedEntriesWindowProps extends TextSelectionProps {
  selectionBox: Box
  selectedEntries: TextSelectionEntry[]

  selecting: boolean
}

function SelectedEntriesWindow(props: SelectedEntriesWindowProps) {
  const rangedSelectedEntries = useMemo(() => {
    const items: { selectedEntry: TextSelectionEntry; symbols: JsonModelSymbol[] }[] = []

    for (const selectedEntry of props.selectedEntries) {
      items.push({
        selectedEntry,
        symbols: props.jsonModel.findAllByValue(selectedEntry.textContent)
      })
    }

    return items
  }, [props.selectedEntries, props.jsonModel])


  const selectedEntriesModifiers: string[] = []
  if (props.selecting) selectedEntriesModifiers.push("selecting")
  if (props.selectedEntries.length === 0) selectedEntriesModifiers.push("hidden")

  const selectedEntriesStyle = {
    "--left": props.selectionBox.center.x,
    "--top": props.selectionBox.center.y
  }

  return (
    <div className={modifiedClass("selected-entries", ...selectedEntriesModifiers)} style={selectedEntriesStyle}>
      <div className="selected-entries__title">
        {props.selectedEntries.length} entries selected
      </div>
      <div className="selected-entries__groups">
        {rangedSelectedEntries.map(({ selectedEntry, symbols: rangedEntries }, index) => (
          <div className="selected-entries-group" key={index}>
            <div className="selected-entries-group__title">{`"${selectedEntry.textContent}"`}</div>
            <div className="selected-entries-group__matches">
              {rangedEntries.map((entry, index) => (
                <div className="selected-entries-match" key={index}>
                  <div className="selected-entries-match__number">{index + 1}.</div>
                  <div className="selected-entries-match__keys">
                    {entry.keyChain.keys.map((key, index) => (
                      <div className="selected-entries-match__key" key={index}>{`"${key}"`}</div>
                    ))}
                  </div>
                  <div className="selected-entries-match__buttons">
                    <button className="selected-entries-match__button" onClick={() => props.onHighlight?.(entry.range)}>👀</button>
                    <button className="selected-entries-match__button" onClick={() => props.onCompare?.(entry.range)}>📰</button>
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

export default SelectedEntriesWindow