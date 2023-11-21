import { startCase } from "lodash"

import Enum, { EnumType } from "@/utils/Enum"

import { SelectOptionElement } from "./Select.types"

/**
 * @param useStartCase - whether or not transform keys to start case (default `false`).
 *
 */
export function optionsFromEntries<T>(entries: [key: string | number, value: string | number][], useStartCase = false): SelectOptionElement<T>[] {
  return entries.map(([key, value], index) => (
    <option value={value} key={index}>{useStartCase ? startCase(String(key)) : key}</option>
  ))
}

/**
 * @param useStartCase - whether or not transform keys to start case (default `false`).
 *
 */
export function optionsFromKeys(keys: string[], useStartCase = false): SelectOptionElement<string>[] {
  return keys.map((key, index) => (
    <option value={key} key={index}>{useStartCase ? startCase(String(key)) : key}</option>
  ))
}

/**
 * @param useStartCase - whether or not transform keys to start case (default `true`).
 *
 */
export function optionsFromEnum(enumerator: EnumType<never>, useStartCase = true): SelectOptionElement[] {
  return optionsFromEntries(Enum.entries(enumerator), useStartCase)
}

export const TrueFalseOptions = [
  <option value={1} key={1}>True</option>,
  <option value={0} key={0}>False</option>
]
