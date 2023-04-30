import "i18next"
import "react-i18next"

declare module "i18next" {
  interface CustomPluginOptions {
    editor?: EditorCustomPluginOptions
  }
}


interface EditorCustomPluginOptions {
  storage?: {
    /**
     * - "local" means language resources are stored locally and a new `backend` module will be established.
     * - "backend" means language resources are stored externally and module `backend` will be used to get and update.
     */
    type?: "local" | "backend"
    /**
     * Relative or absolute path to where resources are stored.
     * It will be compared to resources and namespaces.
     *
     * Use `{namespace}` and `{language}` to mark structure of your languages. If you don't have any namespaces, you can ignore `{namespace}`.
     *
     * @example
     * "app/i18n/locales/{namespace}/{language}.json"
     *
     * @example
     * "app/i18n/locales/{language}.json"
     *
     * @example
     * "../i18n/locales/{language}.json"
     *
     * @example
     * "/home/user/project/i18n/locales/{namespace}/{language}.json"
     */
    resourcePath?: string
  }
}

interface SavingOptions {
  type?: "backend" | "localhost"

  localhost?: {
    /**
     * @default 8008
     */
    port?: number
  }
}
