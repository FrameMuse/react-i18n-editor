import "./DropDown.scss"

import { useLayoutEffect, useRef, useState } from "react"
import { useKey } from "react-use"

import { modifiedClass } from "@/utils/react"

import { childrenToDropDownOptions } from "./DropDown.helpers"
import { DropDownOption, DropDownOptionElement } from "./DropDown.types"

interface DropDownProps<V> {
  /**
   * Open in up direction.
  */
  upwards?: boolean
  size?: "small" | "big"

  expanded: boolean
  defaultValue?: V

  /**
   * Highlights option at this index.
   */
  selectionIndexes?: number[]
  onSelect?(option: DropDownOption<V>): void

  children: DropDownOptionElement<V> | DropDownOptionElement<V>[]
}

function DropDown<V = string | undefined>(props: DropDownProps<V>) {
  const elementRef = useRef<HTMLDivElement>(null)

  const options = childrenToDropDownOptions(props.children)
  const defaultOptionIndex = options.findIndex(option => option.value === props.defaultValue)

  const [selectionPointer, setSelectionPointer] = useState<number>(defaultOptionIndex)

  // Scroll into view currently chosen element.
  useLayoutEffect(() => {
    if (!props.expanded) return
    if (elementRef.current == null) return

    // Get last selected index since it's not possible to scroll to multiple elements.
    const selectionIndex = props.selectionIndexes?.at(-1)
    if (selectionIndex == null) return

    // https://jsfiddle.net/cxe73c22/
    const element = elementRef.current
    const parentElementRect = element.getBoundingClientRect()

    const choiceElement = element.children.item(selectionIndex)
    const choiceElementRect = choiceElement?.getBoundingClientRect()
    if (choiceElementRect == null) return

    const offsetTop = choiceElementRect.top - parentElementRect.top
    const middle = offsetTop - (parentElementRect.height / 2) + (choiceElementRect.height / 2)

    element.scrollBy(0, middle)
  }, [props.expanded])
  // Focus on currently chosen element.
  useLayoutEffect(() => {
    if (elementRef.current == null) return

    const choiceElement = elementRef.current.children.item(selectionPointer)
    if (!(choiceElement instanceof HTMLElement)) return

    choiceElement.focus()
  }, [selectionPointer])

  function shiftSelectionPointer(by: 1 | -1) {
    setSelectionPointer(pointer => {
      const pointerNew = pointer + by
      if (pointerNew >= options.length) {
        return 0
      }
      if (pointerNew < 0) {
        return options.length - 1
      }
      return pointerNew
    })
  }
  function moveSelectionPointer(event: KeyboardEvent) {
    if (!props.expanded) return
    if (elementRef.current == null) return

    event.preventDefault()

    if (event.key === "ArrowUp") shiftSelectionPointer(-1)
    if (event.key === "ArrowDown") shiftSelectionPointer(+1)
  }
  // Take under control only ArrowUp and ArrowDown.
  useKey(event => ["ArrowUp", "ArrowDown"].includes(event.key), moveSelectionPointer)

  function onOptionSelect(index: number) {
    const option = options.at(index)
    if (option == null) return

    props.onSelect?.(option)
  }

  return (
    <div className={modifiedClass("drop-down", props.size, props.expanded && "expanded", props.upwards && "upwards")} role="listbox" aria-expanded={props.expanded} ref={elementRef}>
      {options.map((option, index) => (
        <button
          className={modifiedClass("drop-down__option", props.selectionIndexes?.includes(index) && "selected")}
          onClick={() => onOptionSelect(index)}
          role="option"
          type="button"
          disabled={!props.expanded}
          key={index}
        >{option.title}</button>
      ))}
    </div>
  )
}

export default DropDown
