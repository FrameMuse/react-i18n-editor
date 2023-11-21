// import compiler from "@ampproject/rollup-plugin-closure-compiler"
// import dts from "rollup-plugin-dts"
// import ignoreImport from "rollup-plugin-ignore-import"
// import alias from "@rollup/plugin-alias"
// import path from "path"
import scss from "rollup-plugin-scss"
import { swc } from "rollup-plugin-swc3"

// const pathAlias = alias({
//   entries: [
//     { find: /@(.*)/, replacement: path.resolve("$1") },
//   ]
// })

const config = [
  {
    preserveModules: true,
    input: "src/index.ts",
    output: {
      format: "esm",
      dir: "dist"
    },
    treeshake: true,
    plugins: [
      // typescript(),
      // compiler(),
      swc({
        jsc: {
          loose: true,
          externalHelpers: false,
          parser: {
            syntax: "typescript",
            dynamicImport: true,
            tsx: true,
          },
          transform: {
            react: {
              pragma: "React.createElement",
              pragmaFrag: "React.Fragment",
              throwIfNamespace: true,
              development: false,
              useBuiltins: true,
            },
          }
        },
        // minify: true
      }),
      scss({
        outputStyle: "compressed",
        fileName: "styles/main.css",
        sourceMap: true,
        includePaths: ["src"],
        failOnError: true
      })
    ]
  },
  // {
  //   preserveModules: true,
  //   input: "src/index.ts",
  //   output: {
  //     format: "cjs",
  //     dir: "dist",
  //   },
  //   treeshake: true,
  //   plugins: [
  //     dts(),
  //     ignoreImport({
  //       // Ignore all .scss and .css file imports while building the bundle
  //       extensions: [".scss", ".css"],
  //       // Optional: replace body for ignored files. Default value is "export default undefined;"
  //       body: "export default undefined;"
  //     })
  //   ]
  // }
]

export default config
