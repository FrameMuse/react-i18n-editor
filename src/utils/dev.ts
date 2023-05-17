const accumulatedResult = new Map<string, PerformanceMeasure[]>()

export function measurePerformance<Return>(name: string, callback: () => Return, options?: { accumulate?: number }): Return {
  performance.mark(name + "start")
  const callbackReturn = callback()
  performance.mark(name + "end")

  const result = performance.measure(name, name + "start", name + "end")

  if (options?.accumulate) {
    const measurements = accumulatedResult.get(name) || []
    measurements.push(result)

    accumulatedResult.set(name, measurements)


    const [last1, last2] = [...measurements].reverse()

    if ((last1.startTime - last2.startTime) > (options.accumulate ?? 0)) {
      const min = Math.min(...measurements.map(measurement => measurement.duration))
      const max = Math.max(...measurements.map(measurement => measurement.duration))
      const total = measurements.reduce((result, next) => result + next.duration, 0)

      console.log(`There ${measurements.length} were measurements.`)

      console.log(`Min measurement took ${min} ms.`)
      console.log(`Max measurement took ${max} ms.`)
      console.log(`Total measurements took ${total} ms.`)

      measurements.splice(0, measurements.length)
    }
  } else {
    console.group(name)
    console.trace(`The process took ${result.duration.toFixed(5)} ms.`)
    console.groupEnd()
  }

  return callbackReturn
}
