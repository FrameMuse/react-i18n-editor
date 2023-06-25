import { InitOptions } from "i18next"
import { mapValues } from "lodash"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import I18nEditorUI, { I18N_EDITOR_REFRESH_EVENT } from "./I18nEditorUI"
import { I18nEditorMiddlewareProps, Resources } from "./types"

interface I18nextMiddlewareProps extends I18nEditorMiddlewareProps { }

function I18nextMiddleware(props: I18nextMiddlewareProps) {
  const [, i18n] = useTranslation()

  const [namespace] = useState<string>(resolveNamespace(i18n.options.ns))
  const resources: Resources = useMemo(() => {
    // Extract language namespace to fit to `Resources`.
    return mapValues(i18n.store.data, resource => {
      return resource[namespace] as Resources
    })
  }, [namespace])

  function onResourceChange(resources: Resources) {
    try {
      // Add language namespace back to fit to `i18next` resource type.
      const resourcesWithNamespace = mapValues(resources, resource => ({ [namespace]: resource }))

      i18n.store.data = resourcesWithNamespace
      i18n.emit(I18N_EDITOR_REFRESH_EVENT)
    } catch (error) {
      console.error(error)
    }
  }

  function onLanguageChange(language: string) {
    i18n.changeLanguage(language)
    i18n.emit(I18N_EDITOR_REFRESH_EVENT)
  }

  return (
    <I18nEditorUI
      root={props.root}

      defaultLanguage={i18n.language}
      languages={Object.keys(i18n.store.data)}
      onLanguageChange={onLanguageChange}

      resources={resources}
      onResourcesChange={onResourceChange}
    />
  )
}

export default I18nextMiddleware

function resolveNamespace(namespace: InitOptions["ns"]): string {
  if (namespace == null) {
    return "translation"
  }

  if (namespace instanceof Array) {
    return namespace[0]
  }

  return namespace
}
