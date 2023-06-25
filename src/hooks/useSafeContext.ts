import { Context, useContext } from "react"

function useSafeContext<T>(context: Context<T>): NonNullable<T> {
  const contextValue = useContext(context)
  if (contextValue == null) {
    throw new Error(`${context.displayName} is null.`)
  }

  return contextValue
}

export default useSafeContext
