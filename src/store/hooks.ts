import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux"

import type { AppDispatch, RootState } from "./store.types"

// https://redux.js.org/usage/usage-with-typescript
// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
