import editorContext from "components/I18nEditor/editorContext"
import selectionContext from "components/TextSelection/selectionContext"
import useSafeContext from "hooks/useSafeContext"
import { useAppDispatch, useAppSelector } from "store/hooks"
import { entriesUpdate } from "store/reducers/entries"

import SelectedEntriesWindow from "./SelectedEntriesWindow"


function SelectedEntriesWindowContainer() {
  const editor = useSafeContext(editorContext)
  const selection = useSafeContext(selectionContext)

  const entriesState = useAppSelector(state => state.entries)
  const dispatch = useAppDispatch()

  function onDisplayChange() {
    dispatch(entriesUpdate({ display: !entriesState.display }))
  }

  return (
    <SelectedEntriesWindow
      jsonModel={editor.jsonModel}
      nodesSelected={selection.nodesSelected}

      selecting={selection.selecting}
      selectionBox={selection.box}
      display={entriesState.display}

      onSelect={editor.select}
      onHighlight={editor.highlight}
      onDisplayChange={onDisplayChange}
    />
  )
}

export default SelectedEntriesWindowContainer
