import { Children } from "react"

import { DropDownOption, DropDownOptionElement } from "./DropDown.types"

export function childrenToDropDownOptions<V>(children: DropDownOptionElement<V> | DropDownOptionElement<V>[]): DropDownOption<V>[] {
  const options = Children.map(children, (child, index) => {
    return {
      index,

      title: child.props.title ?? child.props.children,
      value: child.props.value as V,
    }
  })
  return options
}
