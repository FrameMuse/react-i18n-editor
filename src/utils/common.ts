export function isRecord(object: unknown): object is Record<keyof never, unknown> {
  return object instanceof Object && object.constructor === Object
}

export function mapSet<T, U>(set: Set<T>, map: (element: T) => U): U[] {
  const items: U[] = []
  for (const item of set) {
    const itemMapped = map(item)
    items.push(itemMapped)
  }
  return items
}
