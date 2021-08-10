import type { Plugin } from "esbuild";
import * as fs from "fs";
import { compile } from "./compile";
import { PluginOptions, setup } from "./setup";

export default function createRelayPlugin(opts?: PluginOptions): Plugin {
  return {
    name: "relay",
    setup(build) {
      const { options, compileOptions } = setup(build, opts);

      build.onLoad({ filter: options.filter }, async (args) => {
        let contents = await fs.promises.readFile(args.path, "utf8");
        if (contents.includes("graphql`")) {
          contents = compile(args.path, contents, compileOptions);
        }

        return {
          contents: contents,
        };
      });
    },
  };
}
