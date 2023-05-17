import { MutableRefObject, useState } from "react"
import { useEvent } from "react-use"

const DEFAULT_OPTIONS: UseResizeOptions = {
  defaultWidth: 0
}

interface UseResizeOptions {
  defaultWidth: number
}

interface UseResizeState {
  resizing: boolean
  width: number
}

function useResize(resizeElementRef: MutableRefObject<HTMLElement | null>, options?: Partial<UseResizeOptions>): UseResizeState {
  const [resizing, setResizing] = useState(false)
  const [width, setWidth] = useState(options?.defaultWidth ?? DEFAULT_OPTIONS.defaultWidth)

  const [resizeStartX, setResizeStartX] = useState(0)
  const [resizeEndX, setResizeEndX] = useState(width)


  useEvent("pointerdown", (event: PointerEvent) => {
    event.preventDefault()

    setResizing(true)
    setResizeStartX(event.x)
  }, resizeElementRef.current as null)
  useEvent("pointerup", (event: PointerEvent) => {
    if (!resizing) return

    event.preventDefault()


    if (resizeEndX === 0 && width === 0) {
      setWidth(500)
      setResizing(false)
      setResizeEndX(500)
      return
    }

    if (resizeEndX === width) {
      setWidth(0)
      setResizing(false)
      setResizeEndX(0)
      return
    }

    setResizing(false)
    setResizeEndX(width)
  })
  useEvent("pointermove", (event: PointerEvent) => {
    if (!resizing) return
    if (event.pressure < 0.5) return

    event.preventDefault()

    const newWidth = resizeEndX + resizeStartX - event.x
    if (newWidth < 10) {
      setWidth(0)
      return
    }
    setWidth(newWidth)
  })


  return { resizing, width }
}

export default useResize
