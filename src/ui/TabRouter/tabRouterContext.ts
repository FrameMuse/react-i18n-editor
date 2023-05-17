import { createContext, Dispatch, SetStateAction, useContext } from "react"

type TabId = string | number
const tabRouterContext = createContext<[TabId, Dispatch<SetStateAction<TabId>>]>(["", () => { throw new Error("No TabRouter context was found.") }])
export default tabRouterContext

export function useTabRouter() {
  const context = useContext(tabRouterContext)
  return context
}
