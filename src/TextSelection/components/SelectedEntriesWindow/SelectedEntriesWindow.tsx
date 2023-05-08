import "./SelectedEntriesWindow.scss"

import Box from "geometry/Box"
import { RangedEntry } from "RangedEntries"
import { useMemo } from "react"
import { classWithModifiers } from "utils"

import { SelectionEntry, TextSelectionProps } from "../../TextSelection"

interface SelectedEntriesWindowProps extends TextSelectionProps {
  selectionBox: Box
  selectedEntries: SelectionEntry[]
}

function SelectedEntriesWindow(props: SelectedEntriesWindowProps) {
  const rangedSelectedEntries = useMemo(() => {
    const items: { selectedEntry: SelectionEntry; rangedEntries: RangedEntry[] }[] = []

    for (const selectedEntry of props.selectedEntries) {
      items.push({
        selectedEntry,
        rangedEntries: props.rangedEntries.findByValue(selectedEntry.textContent)
      })
    }

    return items
  }, [props.selectedEntries, props.rangedEntries])


  const textSelectionStyle = {
    "--left": props.selectionBox.center.x,
    "--top": props.selectionBox.center.y
  }

  return (
    <div className={classWithModifiers("selected-entries", props.selectedEntries.length === 0 && "hidden")} style={textSelectionStyle}>
      <div className="selected-entries__title">
        {props.selectedEntries.length} entries selected
      </div>
      <div className="selected-entries__groups">
        {rangedSelectedEntries.map(({ selectedEntry, rangedEntries }, index) => (
          <div className="selected-entries-group" key={index}>
            <div className="selected-entries-group__title">{`"${selectedEntry.textContent}"`}</div>
            <div className="selected-entries-group__matches">
              {rangedEntries.map((entry, index) => (
                <div className="selected-entries-match" key={index}>
                  <div className="selected-entries-match__number">{index + 1}.</div>
                  <div className="selected-entries-match__keys">
                    {entry.keys.map((key, index) => (
                      <div className="selected-entries-match__key" key={index}>{key}</div>
                    ))}
                  </div>
                  <div className="selected-entries-match__buttons">
                    <button className="selected-entries-match__button" onClick={() => props.onResourceEditorReveal?.(entry.range)}>👀</button>
                    <button className="selected-entries-match__button" onClick={() => props.onCompareRequest?.(entry.range)}>📰</button>
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
