import { combineReducers, configureStore } from "@reduxjs/toolkit"

import entries from "./reducers/entries"

export const reducers = {
  entries
}

const combinedReducers = combineReducers(reducers)

const store = configureStore({
  reducer: combinedReducers,
})

export default store
