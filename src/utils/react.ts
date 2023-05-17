import { Dispatch, SetStateAction } from "react"

/**
 *
 * @example
 * "class1 class2"
 */
export function classMerge(...classNames: (string | null | undefined)[]): string {
  const space = " "
  return classNames.filter(Boolean).join(space)
}

/**
 * Join modifiers with origin class.
 * @example
 * "origin-class origin-class--modifier"
 */
export function modifiedClass(
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

export function toggleState(setAction: Dispatch<SetStateAction<boolean>>): () => void {
  return () => setAction(state => !state)
}
