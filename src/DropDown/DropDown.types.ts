import { ComponentProps, ReactElement, ReactNode } from "react"

export type DropDownOptionElement<V = unknown> = ReactElement<ComponentProps<"option"> & { value: V }>

export interface DropDownOption<V = unknown> {
  value: V
  title: ReactNode
  index: number
}
