import compiler from "@ampproject/rollup-plugin-closure-compiler"
import typescript from "@rollup/plugin-typescript"
// Plugins
import dts from "rollup-plugin-dts"
import ignoreImport from "rollup-plugin-ignore-import"
import scss from "rollup-plugin-scss"

import pkg from "./package.json"

const config = [
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.main,
        format: "cjs",
      }
    ],
    treeshake: true,
    plugins: [
      typescript(),
      compiler(),
      scss({
        outputStyle: "compressed",
        fileName: "styles/main.css",
        sourceMap: true,
        includePaths: ["src"],
        failOnError: true,
        sass: require("sass")
      })
    ]
  },
  {
    input: "src/index.ts",
    output: [
      {
        file: pkg.types,
        format: "cjs",
      }
    ],
    treeshake: true,
    plugins: [
      dts(),
      ignoreImport({
        // Ignore all .scss and .css file imports while building the bundle
        extensions: [".scss", ".css"],
        // Optional: replace body for ignored files. Default value is "export default undefined;"
        body: "export default undefined;"
      })
    ]
  }
]

export default config
