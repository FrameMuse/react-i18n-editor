<h1 align="center">📦 React i18n Editor</h1>
<h3 align="center">Easy to use plugin for i18n to enable working with editor directly in yuor website</h3>
<p align="center">Furthermore, It's absolutly free and doesn't depened on any third-party source - just you and your project!</p>

## Motivation

There is already existing plugin for it enable such but it provides full support of the features only with prepaid plan.

This library is a **FREE** refinement with intuitive interface, thought through concept and high quality code with TypeScript under the hood.

## Concept

### i18n

This will be a plugin for [`i18n-next`](https://www.npmjs.com/package/i18n-next) to simplify process of development.

### Editor

For editor will be used [`monaco-editor`](https://www.npmjs.com/package/monaco-editor) and for json or yaml validation will be used built-in support of manaco.

It will show up as a overllay on top of a website, may split screen in two with body and an editor and features.

### Word lookup

1. The scripts observes view area and see what elements are included.
1. After clicking and a word it will find all occurances and compare with included elements to find alsmot exact value in language editor that was clicked.

### File system

The editing process involves saving and reading and the problem is that frontend is unable to **write** anything directly into file system.

There are two possible workarrounds:
- Starting a local server to support editing of local files
- Intergrate with existing backend
- Manual changes


