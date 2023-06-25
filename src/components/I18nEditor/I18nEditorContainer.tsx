import TextSelectionProvider from "components/TextSelection/TextSelectionProvider"
import { ReactNode } from "react"
import { Provider as StoreProvider } from "react-redux"
import store from "store/store"
import TabRouter from "ui/TabRouter/TabRouter"

import SplitChildren from "./components/SplitChildren"
import { I18nEditorMiddleware, I18nEditorOptions, I18nEditorTabs } from "./types"

interface I18nEditorContainerProps {
  children: ReactNode
  middleware: I18nEditorMiddleware
  options?: Partial<I18nEditorOptions>
}

function I18nEditorContainer(props: I18nEditorContainerProps) {
  return (
    <SplitChildren baseChildren={props.children}>
      {baseChildrenContainer => (
        <StoreProvider store={store}>
          <TextSelectionProvider root={baseChildrenContainer}>
            <TabRouter defaultPath={I18nEditorTabs.ResourceEditor}>
              <props.middleware root={baseChildrenContainer} />
            </TabRouter>
          </TextSelectionProvider>
        </StoreProvider>
      )}
    </SplitChildren>
  )
}

export default I18nEditorContainer
