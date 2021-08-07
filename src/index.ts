import type { Plugin } from "esbuild";
import { promises } from "fs";
import { compile } from "./compile";

export interface PluginOptions {
  artifactDirectory?: string;
  buildCommand?: string;
  condition?: string;
  devMode?: boolean;
  filter?: RegExp;
  module?: "cjs" | "esm";
  suffix?: string;
}

export default function createRelayPlugin(opts?: PluginOptions): Plugin {
  return {
    name: "relay",
    setup: (build) => {
      let relayConfig: any;
      try {
        // eslint-disable-next-line no-eval
        relayConfig = eval("require")("relay-config").loadConfig();
        // eslint-disable-next-line lint/no-unused-catch-bindings
      } catch (_) {}

      // TODO: Auto-detect Relay config (without relay-config)
      // TODO: Auto-detect TypeScript projects

      opts = Object.assign(
        { filter: /\.tsx$/ },
        opts
      ) as Required<PluginOptions>;

      const compileOptions = Object.assign(
        {},
        {
          artifactDirectory: relayConfig ? relayConfig.artifactDirectory : "",
          devMode: true,
          module: "esm",
        },
        opts
      );

      build.onLoad({ filter: opts.filter, namespace: "" }, async (args) => {
        let contents = await promises.readFile(args.path, "utf8");
        if (contents.includes("graphql`")) {
          contents = compile(args.path, contents, compileOptions);
        }

        return {
          contents: contents,
          loader: "tsx",
        };
      });
    },
  };
}
