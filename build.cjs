#!/usr/bin/env node
const { build, ts, tsconfig, dirname, glob, log } = require("estrella");

const buildOptions = {
  bundle: true,
  minify: process.env.NODE_ENV === "production",
  platform: "node",
  external: ["graphql"],
  target: "node14",
};

build({
  ...buildOptions,
  entry: "src/index.ts",
  outfile: "lib/index.mjs",
  format: "esm",
});

build({
  ...buildOptions,
  entry: "src/index.cjs.ts",
  outfile: "lib/index.cjs",
  format: "cjs",
});

// function generateTypeDefs(tsconfig, entryfiles, outdir) {
//   console.log(tsconfig);

//   const filenames = Array.from(
//     new Set(
//       (Array.isArray(entryfiles) ? entryfiles : [entryfiles]).concat(
//         tsconfig.include || []
//       )
//     )
//   ).filter(Boolean);

//   log.info("Generating type declaration files for", filenames.join(", "));

//   const compilerOptions = {
//     ...tsconfig.compilerOptions,
//     moduleResolution: undefined,
//     declaration: true,
//     outDir: outdir,
//   };

//   const program = ts.ts.createProgram(filenames, compilerOptions);
//   program.emit(undefined, undefined, undefined, true);

//   log.info("Wrote", glob(outdir + "/*.d.ts").join(", "));
// }
