import { ReactNode, useContext } from "react"

import tabRouterContext from "./tabRouterContext"

interface TabRouteProps {
  path: string | number
  children: ReactNode
}

function TabRoute(props: TabRouteProps) {
  const [tab] = useContext(tabRouterContext)

  return <div hidden={tab !== props.path}>{props.children}</div>
}

export default TabRoute
