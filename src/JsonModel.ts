import { editor, IPosition, IRange, Range } from "monaco-editor/esm/vs/editor/editor.api"

import KeyChain from "./KeyChain"
import { isRecord } from "./utils/common"

type JsonModelSymbolType = "array" | "record" | "primitive"

export interface JsonModelSymbol {
  type: JsonModelSymbolType
  value: unknown

  /**
   * A `KeyChain` that leads to where the `value` is stored at.
   */
  atKeyChain: KeyChain
  /**
   * A range at where the `value` is written.
   */
  range: IRange
}

interface JsonModelToken {
  type: JsonModelSymbolType
  value: unknown

  keys: string[]
}

class JsonModel {
  static SymbolPattern = `"([^"]+)"(?=:\\s*[\\[\\{]?)`

  readonly ranges: IRange[] = []
  readonly symbols: JsonModelSymbol[] = []

  private symbolsByRange: Map<IRange, JsonModelSymbol> = new Map
  private symbolsByKeyChain: Map<string, JsonModelSymbol> = new Map

  constructor(
    readonly value: Record<keyof never, unknown>,
    readonly valueSerialized: string
  ) {
    const model = editor.createModel(valueSerialized, "json")

    let searchStart: IPosition = { column: 0, lineNumber: 0 }
    for (const { keys, type, value } of this.tokenize()) {
      const atKeyChain = new KeyChain(keys)

      const match = model.findNextMatch(JsonModel.SymbolPattern, searchStart, true, true, null, true)
      if (match == null) continue
      if (match.matches?.[1] !== atKeyChain.last) continue

      searchStart = match.range.getEndPosition()
      const range = match.range
      const symbol: JsonModelSymbol = { type, value, atKeyChain, range }

      this.ranges.push(range)
      this.symbols.push(symbol)

      this.symbolsByRange.set(range, symbol)
      this.symbolsByKeyChain.set(atKeyChain.serialized, symbol)
    }

    model.dispose()
  }

  private *tokenize(): Generator<JsonModelToken> {
    function *iterate(object: Record<keyof never, unknown> | unknown[], initialKeys: string[] = [], type: JsonModelSymbolType = "record"): Generator<JsonModelToken> {
      // Skipping first iteration.
      if (initialKeys.length > 0) {
        yield { value: object, keys: initialKeys, type }
      }

      for (const [key, value] of Object.entries(object)) {
        const keys: string[] = [...initialKeys]

        if (type === "record") keys.push(key)
        if (type === "array") keys.push(key)

        yield { keys, type: "primitive", value }

        if (isRecord(value)) {
          yield* iterate(value, keys, "record")
        }

        if (value instanceof Array) {
          yield* iterate(value, keys, "array")
        }
      }
    }

    yield* iterate(this.value)
  }

  /**
   * Removes symbol parents (trailing symbols) according to given `symbol`.
   *
   * @returns new array.
   *
   * @example
   * [
   *   "view",
   *   "view.home",
   *   "view.home.page",
   *   "view.home.page.title"
   * ]
   * =>
   * ["view.home.page.title"]
   */
  private removeSymbolParents(symbol: JsonModelSymbol, symbols: JsonModelSymbol[]): JsonModelSymbol[] {
    return symbols.filter(otherSymbol => !symbol.atKeyChain.startsWith(otherSymbol.atKeyChain))
  }

  public getByRange(range: IRange): JsonModelSymbol {
    const item = this.symbolsByRange.get(range)
    if (item == null) {
      throw new Error("Couldn't get by range.")
    }

    return item
  }

  public getByKeyChain(keyChain: KeyChain | string): JsonModelSymbol {
    const item = this.symbolsByKeyChain.get(KeyChain.parse(keyChain).serialized)
    if (item == null) {
      throw new Error("Couldn't get by keyChain.")
    }

    return item
  }

  /**
   * Finds first `JsonModelSymbol` that contains `otherRange`.
   */
  public findInRange(otherRange: IRange): JsonModelSymbol {
    const range = this.ranges.find(range => Range.containsRange(range, otherRange))
    if (range == null) {
      throw new Error("Couldn't find an entry in the range.")
    }

    return this.getByRange(range)
  }

  /**
   * Finds all `JsonModelSymbol` that contains `value`.
   */
  public findAllByValue(value: string): JsonModelSymbol[] {
    // Escaping \n to make values fairly comparable.
    value = value.replace(/\n/g, "\\n")

    let foundSymbols: JsonModelSymbol[] = []
    for (const symbol of this.symbolsByRange.values()) {
      //! Heavy operation.
      if (!JSON.stringify(symbol.value).includes(value)) continue

      // Remove symbol parents before push to ensure we don't remove current `symbol`.
      foundSymbols = this.removeSymbolParents(symbol, foundSymbols)
      foundSymbols.push(symbol)
    }

    return foundSymbols
  }

  /**
   * Creates `JsonModel` just from a `Record`.
   */
  static fromValue(value: Record<keyof never, unknown>): JsonModel {
    const string = JSON.stringify(value, null, 2)
    return new JsonModel(value, string)
  }
  /**
   * Creates `JsonModel` just from a `string`.
   */
  static fromSerialized(serialized: string): JsonModel {
    const value = JSON.parse(serialized)
    return new JsonModel(value, serialized)
  }


  static findMatches(model: editor.ITextModel) {
    return model.findMatches(this.SymbolPattern, false, true, false, null, false, 5000)
  }

  static isSymbol(value: string): boolean {
    return new RegExp(this.SymbolPattern).test(value)
  }
}

export default JsonModel
