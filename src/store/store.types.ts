import store from "./store"

export interface StoreAction<T, P> {
  type: T
  payload: P
}

export type MapActions<T> = { [K in keyof T]: StoreAction<K, T[K]> }
export type InferActions<T> = MapActions<T>[keyof MapActions<T>]



// https://react-redux.js.org/using-react-redux/usage-with-typescript#define-root-state-and-dispatch-types

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
