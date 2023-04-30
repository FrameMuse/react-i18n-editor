/*

MIT License

Copyright (c) 2023 Valery Zinchenko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

*/

import MonacoEditor from "@monaco-editor/react"
import { useContext, useEffect, useState } from "react"
import { I18nContext } from "react-i18next"


interface I18nextEditorContainerProps {}

function I18nextEditorContainer(props: I18nextEditorContainerProps) {
  const { i18n } = useContext(I18nContext)
  const [loading, setLoading] = useState(true)

  const [language, setLanguage] = useState(i18n.language)
  const [namespace, setNamespace] = useState("translation")

  const [readOnly, setReadOnly] = useState(false)
  const [content, setContent] = useState("")
  const [canSave, setCanSave] = useState(false)

  async function save() {
    i18n.modules.backend?.save?.(language, namespace, JSON.parse(content))
  }

  // Temporary update language resource for preview.
  useEffect(() => {
    try {
      i18n.store.data[i18n.language]["translation"] = JSON.parse(content)
      i18n.emit("react-refresh")

      setCanSave(true)
    } catch (error) {
      setCanSave(false)
    }
  }, [content])
  // onLanguageChanged
  useEffect(() => {
    i18n.on("languageChanged", setLanguage)
    return () => {
      i18n.off("languageChanged", setLanguage)
    }
  }, [i18n])
  // onLoaded
  useEffect(() => {
    function loadedEvent() {
      setLoading(false)
    }

    i18n.on("loaded", loadedEvent)
    return () => {
      i18n.off("loaded", loadedEvent)
    }
  }, [i18n])


  if (loading) {
    return <>Loading...</>
  }

  return (
    <div className="i18n-editor">
      <div className="i18n-editor__container">
        <MonacoEditor
          language="json"
          defaultLanguage="json"

          options={{ readOnly }}
          onChange={value => value && setContent(value)} />
      </div>
      <div className="i18n-editor__toolbar">
        {canSave && (
          <button onClick={save}>Save</button>
        )}
      </div>
    </div>
  )
}

export default I18nextEditorContainer

// class ReactJSONEditorContainer extends Component<I18nextEditorContainerProps> {
//   componentDidMount() {
//     const rootElement = document.getElementById("root")
//     if (rootElement === null) {
//       throw new Error("no #root element found")
//     }

//     rootElement.style.maxWidth = "75vw"

//     const i18n = this.props.i18n
//     i18n.reloadResources((i18n.options.supportedLngs || []).slice(0, -1), "translation")
//     i18n.on("languageChanged", () => {
//       const resourceKey = i18n.store.data[i18n.language]["translation"]

//       this.editor?.set(resourceKey)
//     })
//   }

//   componentWillUnmount() {
//     const rootElement = document.getElementById("root")
//     if (rootElement === null) {
//       throw new Error("no #root element found")
//     }

//     rootElement.removeAttribute("style")
//   }

//   async putUpdate() {
//     const data = this.editor?.get()
//     if (data == null) return

//     const i18n = this.props.i18n
//     const put = i18n.options.editor
//     if (put == null) return


//     await put(i18n.language, "translation", data)

//     alert("Successfully updated")
//   }
// }

// export default ReactJSONEditorContainer
