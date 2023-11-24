<h1 align="center">📦 React i18n Editor</h1>
<h3 align="center">Enables localization editor directly on your website</h3>
<p align="center">It's developer oriented, completely free and has built-in <a href="https://www.npmjs.com/package/i18next"><code>i18next</code></a> support</p>
<a href="https://www.producthunt.com/posts/react-i18n-editor?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-react&#0045;i18n&#0045;editor" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=394880&theme=neutral" alt="React&#0032;i18n&#0032;Editor - react&#0044;&#0032;i18n&#0044;&#0032;i18next&#0044;&#0032;editor&#0044;&#0032;plugin&#0044;&#0032;package&#0044;&#0032;typescript | Product Hunt" style="width: 100%; height: 45px;" /></a>

## Feedback

Please, star the repository and create discussions if you like this library, this means a lot for me.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/D1D8IZ8TU)

## Introduction

It allows you to create translation from scratch, editing existing localization and saving this to backend while being on the webpage the whole time.

This library is a **FREE** refinement of the existing solution with intuitive interface, thought through concept and high quality code with TypeScript under the hood.
It's developer oriented, which means full support and discussion open.

## Motivation

- When editing existing localization it's hard finding values in editor every time manually, even worse if you need to edit multiple languages at the same time.
- If you have dedicated a translator or your _clients_ want to edit localization on their own in future, you need a "localization editing" feature for them, which not every team can afford.

There is already existing plugin for it to enable editor, but it's currently deprecated, not complete free and has constrained design.

## Usage

Live demo

### Install

```bash
bun i react-i18n-editor

npm i react-i18n-editor
pnpm i react-i18n-editor

yarn add react-i18n-editor
```

### Import

Import `I18nEditorContainer` and `I18nextMiddleware` to connect to an existing `i18next` context.

```tsx
import "react-i18n-editor/dist/styles/main.css"

import i18next from "i18next"
import { I18nEditorContainer, I18nextMiddleware } from "react-i18n-editor"

function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <I18nEditorContainer middleware={I18nextMiddleware}>
        {/* ... Whole App or Area you want to be highlightable ... */}
      </I18nEditorContainer>
    </I18nextProvider>
  )
}
```

#### Styles

This is vital to work as intended - you need to import library styles

```ts
import "react-i18n-editor/dist/styles/main.css"
```

### Hot-keys

| Binding | Description |
|---|---|
| `ctrl + Mouse Left` | Enables selecting an area on the page |

### Laziness

This library might be pretty heavy for your website, so don't forget to use `React.lazy` when importing the components.

Start with creating new file (`I18nEditorLazy.tsx`) with `I18nEditorContainer`

**`I18nEditorLazy.tsx`**

---

```tsx
import "react-i18n-editor/dist/styles/main.css"

import { ReactNode } from "react"
import { I18nEditorContainer, I18nextMiddleware } from "react-i18n-editor"

interface AppI18nEditorContainerProps {
  children: ReactNode
}

function AppI18nEditorContainer(props: AppI18nEditorContainerProps) {
  return (
    <I18nEditorContainer middleware={I18nextMiddleware}>
      {props.children}
    </I18nEditorContainer>
  )
}

// This is essential part for `React.lazy`.
export default AppI18nEditorContainer
```

**`App.tsx`**

---

```tsx
import i18next from "i18next"
import { lazy } from "react"

const AppI18nEditorContainerLazy = lazy(() => import("./AppI18nEditorContainer"))

function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <AppI18nEditorContainerLazy>
        {/* ... Whole App or Area you want to be highlightable ... */}
      </AppI18nEditorContainerLazy>
    </I18nextProvider>
  )
}
```

You can implement it to your admin panel, so only admins will load this heavy editor but not your precious users :_>

### Not [`i18next`](https://www.npmjs.com/package/i18next)

To connect `i18next`, you will need `i18next-react` and pass `I18nextMiddleware` component to `container` prop in `I18nEditorContainer`

```tsx
import "react-i18n-editor/dist/styles/main.css"

import i18next from "i18next"
import { I18nEditorContainer, I18nextMiddleware } from "react-i18n-editor"

function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <I18nEditorContainer middleware={I18nextMiddleware}>
        {/* ... Whole App or Area you want to be highlightable ... */}
      </I18nEditorContainer>
    </I18nextProvider>
  )
}
```

However if you don't want to use `i18next` and you use your custom localization service, you can customize behavior by creating your own container similar to `I18nextMiddleware`.

Start from creating a component similar to `I18nextMiddleware`

- Import `I18nEditorUI` and `I18nEditorContainerProps` type
- Create interlayer between `I18nEditorUI` and your implementation of localization service.

```tsx
import { I18nEditorUI } from "react-i18n-editor"
import type { I18nEditorContainerProps } from "react-i18n-editor"

// Abstract of your localization service.
import myCustomLocalization from "./myCustomLocalization"

interface MyCustomEditorContainerProps extends I18nEditorContainerProps {}

function MyCustomEditorContainer(props: MyCustomEditorContainerProps) {
  const defaultLanguage = myCustomLocalization.getDefaultLanguage()
  const languages = myCustomLocalization.getLanguages()
  const resources = myCustomLocalization.getResources()

  function onLanguageChange() {
    // ...
  }
  function onResourceChange() {
    // ...
  }

  return (
    <I18nEditorUI
      root={props.root}

      defaultLanguage={defaultLanguage}
      languages={languages}
      onLanguageChange={onLanguageChange}

      resources={resources}
      onResourcesChange={onResourceChange}
    />
  )
}
```

Then simply pass your `MyCustomEditorContainer` to `container` prop as you do with `I18nextMiddleware` and that's it.

```tsx
import "react-i18n-editor/dist/styles/main.css"

import i18next from "i18next"
import { I18nEditorContainer } from "react-i18n-editor"

import MyCustomEditorContainer from "./MyCustomEditorContainer"

function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <I18nEditorContainer container={MyCustomEditorContainer}>
        {/* ... Whole App or Area you want to be highlightable ... */}
      </I18nEditorContainer>
    </I18nextProvider>
  )
}
```

### Contribution

Please, help me moving this library forward with your feedback to [GitHub Issues](https://github.com/FrameMuse/react-i18n-editor/issues) or [my discord server](https://discord.gg/DCUWrRhvnt) \\(^_^)
