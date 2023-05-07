import { ReactNode, useContext } from "react"

import tabRouterContext from "./tabRouterContext"

interface TabRouteProps {
  // keepMounted?: boolean

  path: string | number
  children: ReactNode
}

function TabRoute(props: TabRouteProps) {
  const [tab] = useContext(tabRouterContext)
  return <div hidden={tab !== props.path}>{props.children}</div>
  // if (props.keepMounted) {
  // }

  // ///// V1
  // if (tab !== props.path) {
  //   return null
  // }

  // return <>{props.children}</>

  ///// V2
  // return (
  //   <div hidden={tab !== props.path}>{props.children}</div>
  // )

  ///// V3

  // if (props.children instanceof Array) {
  //   return (
  //     <>
  //       {(props.children as ReactNode[]).map(child => {
  //         if (typeof child !== "object") return child
  //         if (child === null) return child
  //         if (!("type" in child)) return child

  //         return cloneElement(child, {
  //           // ...child.props,
  //           hidden: tab !== props.path ? true : child.props.hidden
  //         })
  //       })}
  //     </>
  //   )
  // }

  // return <>{props.children}</>
}

export default TabRoute
