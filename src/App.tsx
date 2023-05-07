import i18next from "i18next"
import { I18nextProvider, useTranslation } from "react-i18next"

import I18nextEditorContainer from "./I18nextEditorContainer"

function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <Test />
      <I18nextEditorContainer />
    </I18nextProvider>
  )
}

function Test() {
  const { t } = useTranslation()

  return (
    <>
      <span>{t("test")} {t("lines.0")}</span>
      <div>{t("penis")}</div>
      <div>{t("pek.general.emptyBlock.title")}</div>
      <div>{t("pek.popup.bonusSingle.tasks.battle.tasks.case.buttonName")}</div>
    </>
  )
}

require("./config")


export default App
