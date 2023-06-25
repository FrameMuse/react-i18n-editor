import Box from "geometry/Box"
import { createContext } from "react"

import TextSelectionNode from "./TextSelectionNode"

export interface TextSelectionContext {
  box: Box
  nodes: TextSelectionNode[]
  nodesSelected: TextSelectionNode[]

  selecting: boolean
}

const selectionContext = createContext<TextSelectionContext | null>(null)
export default selectionContext
