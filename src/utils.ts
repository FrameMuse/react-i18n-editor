import { Dispatch, SetStateAction } from "react"

/**
 *
 * @returns `class1 class2`
 */
export function classMerge(...classNames: (string | null | undefined)[]): string {
  const space = " "
  return classNames.filter(Boolean).join(space)
}

/**
 * Join modifiers with origin class.
 * @returns `"origin-class origin-class--modifier"`
 */
export function classWithModifiers(
  originClass: string,
  ...modifiers: (string | number | false | null | undefined)[]
): string {
  modifiers = modifiers.filter(Boolean)
  if (!modifiers.length) return originClass

  const space = " "
  const separator = "--"

  modifiers = modifiers.map(modifier => originClass + separator + modifier)
  return originClass + space + modifiers.join(space)
}

/**
 * Creates query from given object.
 * - Stringify objects and arrays
 * - Supports deep nesting
 * @returns `state1=6&state2=horse` without `?`
 */
export function createQuery(queryObject?: Record<string | number, unknown> | null): string {
  if (!queryObject || !Object.keys(queryObject).length) return ""

  const queryKeys = Object.keys(queryObject)
  const queryArray = queryKeys.map(key => {
    const value = queryObject[key]
    if (value) {
      if (isRecord(value)) {
        return createQuery(value)
      }

      return encodeURIComponent(key) + "=" + encodeURIComponent(String(value))
    }
    return ""
  })

  return queryArray.filter(Boolean).join("&")
}

export function isRecord(object: unknown): object is Record<keyof never, unknown> {
  return object instanceof Object && object.constructor === Object
}

export function toggleState(setAction: Dispatch<SetStateAction<boolean>>): () => void {
  return () => setAction(state => !state)
}
