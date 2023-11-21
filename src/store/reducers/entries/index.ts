import { InferActions } from "../../store.types"
import { EntriesState } from "./types"

const initialState: EntriesState = {
  display: true
}

export interface Actions {
  ENTRIES_UPDATE: Partial<EntriesState>
  ENTRIES_RESET: void
}

export default (state = initialState, action: InferActions<Actions>): EntriesState => {
  switch (action.type) {

    case "ENTRIES_UPDATE":
      return { ...state, ...action.payload }

    case "ENTRIES_RESET":
      return { ...initialState }

    default:
      return state
  }
}

export const entriesUpdate = (payload: Actions["ENTRIES_UPDATE"]) => ({
  type: "ENTRIES_UPDATE",
  payload
}) as const

export const entriesReset = () => ({
  type: "ENTRIES_RESET"
}) as const
