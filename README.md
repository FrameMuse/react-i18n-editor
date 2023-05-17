<h1 align="center">📦 React i18n Editor</h1>
<h3 align="center">Enables localization editor directly on your website</h3>
<p align="center">It's developer oriented, completely free and has built-in <a href="https://www.npmjs.com/package/i18next"><code>i18next</code></a> support</p>
<a href="https://www.producthunt.com/posts/react-i18n-editor?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-react&#0045;i18n&#0045;editor" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=394880&theme=neutral" alt="React&#0032;i18n&#0032;Editor - react&#0044;&#0032;i18n&#0044;&#0032;i18next&#0044;&#0032;editor&#0044;&#0032;plugin&#0044;&#0032;package&#0044;&#0032;typescript | Product Hunt" style="width: 100%; height: 45px;" /></a>

## Introduction

It allows you to create translation from scratch, editing existing localization and saving this to backend while being on the webpage the whole time.

This library is a **FREE** refinement of the existing solution with intuitive interface, thought through concept and high quality code with TypeScript under the hood.
It's developer oriented, which means full support and discussion open.

## Motivation

- When editing existing localization it's hard finding values in editor every time manually, moreover if you need to edit multiple languages at the same time.
- If you have dedicated translator or your _clients_ want to edit localization on their own in future, you need a "localization editing unit", which not every team can afford it.

There is already existing plugin for it to enable editor, but it's currently deprecated, not complete free and has constrained design.

## Usage

### Install

```bash
npm i react-i18n-editor
```

### Import

Note: You also import `I18nextEditorContainer` to connect to `I18nextProvider`.

```tsx
import "react-i18n-editor/dist/styles/main.css"

import i18next from "i18next"
import { I18nEditorBoundary, I18nextEditorContainer } from "react-i18n-editor"

function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <I18nEditorBoundary container={I18nextEditorContainer}>
        {/* ... Whole App or Area you want to be highlightable ... */}
      </I18nEditorBoundary>
    </I18nextProvider>
  )
}
```

#### Styles

This is vital to work as intended - you need to import library styles

```ts
import "react-i18n-editor/dist/styles/main.css"
```

### Laziness

This library might be pretty heavy for your website, so don't forget to use `React.lazy` when importing the components.

Start with creating new file (`I18nEditorLazy.tsx`) with `I18nEditorBoundary`

// `I18nEditorLazy.tsx`

---

```tsx
import "react-i18n-editor/dist/styles/main.css"

import { ReactNode } from "react"
import { I18nEditorBoundary, I18nextEditorContainer } from "react-i18n-editor"

interface AppI18nEditorBoundaryProps {
  children: ReactNode
}

function AppI18nEditorBoundary(props: AppI18nEditorBoundaryProps) {
  return (
    <I18nEditorBoundary container={I18nextEditorContainer}>
      {props.children}
    </I18nEditorBoundary>
  )
}

// This is essential part for `React.lazy`.
export default AppI18nEditorBoundary
```

// `App.tsx`

---

```tsx
import i18next from "i18next"
import { lazy } from "react"

const AppI18nEditorBoundaryLazy = lazy(() => import("./AppI18nEditorBoundary"))

function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <AppI18nEditorBoundaryLazy>
        {/* ... Whole App or Area you want to be highlightable ... */}
      </AppI18nEditorBoundaryLazy>
    </I18nextProvider>
  )
}
```

You can implement it to your admin panel, so only admins will load this heavy editor but not your precious users :_>

### Not [`i18next`](https://www.npmjs.com/package/i18next)

To connect `i18next`, you will need `i18next-react` and pass `I18nextEditorContainer` component to `container` prop in `I18nEditorBoundary`

```tsx
import "react-i18n-editor/dist/styles/main.css"

import i18next from "i18next"
import { I18nEditorBoundary, I18nextEditorContainer } from "react-i18n-editor"

function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <I18nEditorBoundary container={I18nextEditorContainer}>
        {/* ... Whole App or Area you want to be highlightable ... */}
      </I18nEditorBoundary>
    </I18nextProvider>
  )
}
```

However if you don't want to use `i18next` and you use your custom localization service, you can customize behavior by creating your own container similar to `I18nextEditorContainer`.

Start from creating a component similar to `I18nextEditorContainer`

- Import `I18nEditor` and `I18nEditorContainerProps` type
- Create interlayer between `I18nEditor` and your implementation of localization service.

```tsx
import { I18nEditor } from "react-i18n-editor"
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
    <I18nEditor
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

Then simply pass your `MyCustomEditorContainer` to `container` prop as you do with `I18nextEditorContainer` and that's it.

```tsx
import "react-i18n-editor/dist/styles/main.css"

import i18next from "i18next"
import { I18nEditorBoundary } from "react-i18n-editor"

import MyCustomEditorContainer from "./MyCustomEditorContainer"

function App() {
  return (
    <I18nextProvider i18n={i18next}>
      <I18nEditorBoundary container={MyCustomEditorContainer}>
        {/* ... Whole App or Area you want to be highlightable ... */}
      </I18nEditorBoundary>
    </I18nextProvider>
  )
}
```

### Contribution

Please, help me moving this library forward with your feedback to [GitHub Issues](https://github.com/FrameMuse/react-i18n-editor/issues) or [my discord server](https://discord.gg/DCUWrRhvnt) \\(^_^)
