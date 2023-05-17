class KeyChain {
  readonly last: string
  readonly keys: string[]
  /**
   * A serialized view of the `KeyChain`.
   *
   * @example
   * "view.home.page.title"
   */
  readonly serialized: string

  constructor(keys: string[]) {
    const last = keys.at(-1)
    if (last == null) {
      throw new Error("`keys` should contain at least one element.")
    }

    this.last = last
    this.keys = keys
    this.serialized = keys.join(".")
  }

  /**
   * Whether `otherKeyChain` is a parent of `this` KeyChain.
   *
   * @example
   * "view.home.page" is parent of "view.home.page.title"
   */
  public startsWith(otherKeyChain: KeyChain): boolean {
    return this.serialized.startsWith(otherKeyChain.serialized)
  }

  static parse(keyChain: KeyChain | string): KeyChain {
    if (keyChain instanceof KeyChain) {
      return keyChain
    }

    return new KeyChain(keyChain.split("."))
  }
}

export default KeyChain
