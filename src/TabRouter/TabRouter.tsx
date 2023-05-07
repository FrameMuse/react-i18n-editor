import { ReactNode, useState } from "react"

import tabRouterContext from "./tabRouterContext"

interface TabRouterProps {
  defaultPath?: string | number
  children: ReactNode
}

function TabRouter(props: TabRouterProps) {
  const tabState = useState(props.defaultPath ?? "")

  return (
    <tabRouterContext.Provider value={tabState}>
      {props.children}
    </tabRouterContext.Provider>
  )
}

export default TabRouter
