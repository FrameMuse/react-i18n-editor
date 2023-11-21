import editorContext from "@/components/I18nEditor/editorContext"
import useSafeContext from "@/hooks/useSafeContext"
import KeyChain from "@/KeyChain"

import ComparisonTable from "./ComparisonTable"

function ComparisonTableContainer() {
  const editor = useSafeContext(editorContext)

  function onChange(language: string, keyChain: KeyChain, value: string) {
    editor.updateResourceAt(keyChain, value, language)
  }

  function onKeyChainClick(keyChain: KeyChain) {
    const symbol = editor.jsonModel.getByKeyChain(keyChain)
    editor.highlight(symbol.range)
  }

  return (
    <ComparisonTable
      languages={editor.languages}
      resources={editor.resources}
      symbol={editor.selectedSymbol}

      onChange={onChange}
      onKeyChainClick={onKeyChainClick}
    />
  )
}

export default ComparisonTableContainer
