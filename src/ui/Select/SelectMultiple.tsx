import "./Select.scss"

import { useRef, useState } from "react"
import { useClickAway } from "react-use"

import { modifiedClass, toggleState } from "@/utils/react"

import DropDown from "../DropDown/DropDown"
import { childrenToDropDownOptions } from "../DropDown/DropDown.helpers"
import { DropDownOption } from "../DropDown/DropDown.types"
import { BaseSelectProps } from "./Select.types"

const SELECT_EMPTY_PLACEHOLDER = "Select from list..."

interface SelectMultipleProps<V> extends Omit<BaseSelectProps<V>, "defaultValue"> {
  defaultValue?: V[]
  onChange?(value: V[]): void
}

// eslint-disable-next-line @typescript-eslint/ban-types
function SelectMultiple<V extends {} = string>(props: SelectMultipleProps<V>) {
  const [expanded, setExpanded] = useState(false)

  const options: DropDownOption<V>[] = childrenToDropDownOptions(props.children)
  const optionDefault = options.filter(option => props.defaultValue?.includes(option.value))
  const [optionsSelected, setOptionsSelected] = useState<DropDownOption<V>[]>(optionDefault)

  function emitOnChange(options: DropDownOption<V>[]) {
    const values = options.map(option => option.value)
    props.onChange?.(values)
  }

  function select(option: DropDownOption<V>) {
    const optionsSelectedNew = [...optionsSelected, option]

    emitOnChange(optionsSelectedNew)
    setOptionsSelected(optionsSelectedNew)
  }

  function deselect(option: DropDownOption<V>) {
    const optionsSelectedNew = optionsSelected.filter(optionSelected => optionSelected.index !== option.index)

    emitOnChange(optionsSelectedNew)
    setOptionsSelected(optionsSelectedNew)
  }

  function toggle(option: DropDownOption<V>) {
    const optionSelected = optionsSelected.find(optionSelected => optionSelected.index === option.index)
    if (optionSelected == null) {
      select(option)
      return
    }

    deselect(option)
  }

  const parentRef = useRef<HTMLDivElement>(null)
  useClickAway(parentRef, () => setExpanded(false))

  return (
    <div className="select" style={{ "--select-width": props.width }} ref={parentRef}>
      {props.label && (
        <div className="select__label">{props.label}</div>
      )}
      <button className={modifiedClass("select__appearance", props.size)} type="button" onClick={toggleState(setExpanded)}>
        {optionsSelected.length > 0 && (
          <div className={modifiedClass("select-selected", "multiple")}>
            <div className="select-selected__options">
              {[...optionsSelected].map(option => (
                <div className="select-selected__option" key={option.index} onClick={event => (event.stopPropagation(), deselect(option))}>
                  <span>{option.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {optionsSelected.length === 0 && (
          <div className={modifiedClass("select-selected", "empty", "multiple")}>
            {props.placeholder || SELECT_EMPTY_PLACEHOLDER}
          </div>
        )}
      </button>
      <DropDown<V>
        size={props.size}
        upwards={props.upwards}
        defaultValue={props.defaultValue?.at(-1)}

        selectionIndexes={optionsSelected.map(option => option.index)}
        expanded={expanded}
        onSelect={toggle}
      >
        {props.children}
      </DropDown>
      {props.name && [...optionsSelected].map(option => (
        <input type="hidden" name={props.name} value={option.value as never} key={option.index} />
      ))}
    </div>
  )
}

export default SelectMultiple
