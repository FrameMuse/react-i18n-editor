import { editor, IPosition, IRange, Range } from "monaco-editor/esm/vs/editor/editor.api"
import { isRecord } from "utils"

type ObjectType = "array" | "record" | "primitive"

interface ValueKey {
  value: unknown
  keys: string[]
}

export interface RangedEntry {
  value: unknown
  keys: string[]
  range: IRange
}

// interface ValueRange {
//   value: unknown
//   range: IRange
// }

class RangedEntries {
  readonly ranges: IRange[] = []
  readonly rangedEntries: Map<IRange, ValueKey> = new Map

  // readonly flattenObjectWithRange: Map<string, ValueRange> = new Map

  constructor(
    private object: Record<keyof never, unknown> | unknown[],
    model: editor.IModel
  ) {
    let searchStart: IPosition = { column: 0, lineNumber: 0 }

    this.traverse((keys, value, type) => {
      function getSearchString() {
        const lastKey = keys.at(-1)
        const fieldSearch = lastKey?.startsWith("[") ? "" : `"${lastKey}":`

        switch (type) {
          case "array":
            return fieldSearch + `\\s*?\\[`
          case "record":
            return fieldSearch + `\\s*?\\{`

          default:
            return fieldSearch
        }
      }

      const match = model.findNextMatch(getSearchString(), searchStart, true, false, null, false)
      if (match == null) return

      searchStart = match.range.getEndPosition()
      const range = match.range

      this.ranges.push(range)
      this.rangedEntries.set(range, { value, keys })

      // this.keys.push(flattenKeys)
      // this.flattenObject[flattenKeys] = value
      // this.flattenObjectWithRange.set(flattenKeys, { value, range })
    })
  }

  private traverse(callback: (keys: string[], value: unknown, type: ObjectType) => void): void {
    function iterate(object: Record<keyof never, unknown> | unknown[], initialKeys: string[] = [], type: ObjectType = "record") {
      for (const [key, value] of Object.entries(object)) {
        const keys: string[] = [...initialKeys]
        if (type === "record") keys.push(key)
        if (type === "array") keys.push(`[${key}]`)

        if (isRecord(value)) {
          callback(keys, value, "record")
          iterate(value, keys, "record")

          continue
        }

        if (value instanceof Array) {
          callback(keys, value, "array")
          iterate(value, keys, "array")

          continue
        }

        callback(keys, value, "primitive")
      }
    }

    iterate(this.object)
  }

  // public containsKey(key: string): boolean {
  //   return this.keys.includes(key)
  // }

  public containsRange(range: IRange): boolean {
    return this.ranges.includes(range)
  }

  // public containsPosition() {}

  // public getByKey(key: string): ValueRange {
  //   const item = this.flattenObjectWithRange.get(key)
  //   if (item == null) {
  //     throw new Error("Couldn't get by key.")
  //   }

  //   return item
  // }

  public getByRange(range: IRange): ValueKey {
    const item = this.rangedEntries.get(range)
    if (item == null) {
      throw new Error("Couldn't get by range.")
    }

    return item
  }

  public findByRange(otherRange: IRange): ValueKey {
    const range = this.ranges.find(range => Range.containsRange(range, otherRange))
    if (range == null) {
      throw new Error("Couldn't find an entry in the range.")
    }

    return this.getByRange(range)
  }

  public findByValue(value: string): RangedEntry[] {
    let rangedEntries: RangedEntry[] = []

    for (const [range, entry] of this.rangedEntries.entries()) {

      if (JSON.stringify(entry.value).includes(value)) {
        rangedEntries = rangedEntries.filter(otherEntry => {
          if (entry.keys.join(".").startsWith(otherEntry.keys.join("."))) {
            return false
          }

          return true
        })
        rangedEntries.push({ ...entry, range })
      }
    }

    return rangedEntries
  }
}

export default RangedEntries
