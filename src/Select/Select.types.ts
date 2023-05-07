import { ComponentProps, ReactElement, ReactNode } from "react"

export type SelectOptionElement<V = unknown> = ReactElement<ComponentProps<"option"> & { value: V }>

export interface BaseSelectProps<V = unknown> {
  name?: string
  width?: string
  placeholder?: string
  label?: ReactNode
  size?: "small"
  /**
   * Open in up direction.
  */
  upwards?: boolean

  // value?: V
  defaultValue?: V
  onChange?(value: V | V[]): void
  children: SelectOptionElement<V> | SelectOptionElement<V>[]
}
