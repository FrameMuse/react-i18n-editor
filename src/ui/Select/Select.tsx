import "./Select.scss"

import { useRef, useState } from "react"
import { useClickAway } from "react-use"
import { modifiedClass, toggleState } from "utils/react"

import DropDown from "../DropDown/DropDown"
import { childrenToDropDownOptions } from "../DropDown/DropDown.helpers"
import { DropDownOption } from "../DropDown/DropDown.types"
import { BaseSelectProps } from "./Select.types"

const SELECT_EMPTY_PLACEHOLDER = "Select from list..."

interface SelectProps<V> extends BaseSelectProps<V> {
  onChange?(value: V): void
}

// eslint-disable-next-line @typescript-eslint/ban-types
function Select<V extends {} = string>(props: SelectProps<V>) {
  const [expanded, setExpanded] = useState(false)

  const options: DropDownOption<V>[] = childrenToDropDownOptions(props.children)
  const optionDefault = options.find(option => option.value === props.defaultValue)
  const [optionSelected, setOptionSelected] = useState<DropDownOption<V> | undefined>(optionDefault)

  function onSelect(option: DropDownOption<V>) {
    props.onChange?.(option.value)

    setExpanded(false)
    setOptionSelected(option)
  }

  const parentRef = useRef<HTMLDivElement>(null)
  useClickAway(parentRef, () => setExpanded(false))

  return (
    <div className="select" style={{ "--select-width": props.width }} ref={parentRef}>
      {props.label && (
        <div className="select__label">{props.label}</div>
      )}
      <button className={modifiedClass("select__appearance", props.size)} type="button" onClick={toggleState(setExpanded)}>
        {optionSelected && (
          <div className="select-selected">{optionSelected.title}</div>
        )}
        {!optionSelected && (
          <div className={modifiedClass("select-selected", "empty")}>
            {props.placeholder || SELECT_EMPTY_PLACEHOLDER}
          </div>
        )}
      </button>
      <DropDown<V>
        size={props.size}
        upwards={props.upwards}
        defaultValue={props.defaultValue}

        selectionIndexes={optionSelected && [optionSelected.index]}
        expanded={expanded}
        onSelect={onSelect}
      >
        {props.children}
      </DropDown>
      {props.name && (
        <input type="hidden" name={props.name} value={optionSelected?.value as never} />
      )}
    </div>
  )
}

export default Select
