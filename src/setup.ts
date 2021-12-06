import type { PluginBuild } from "esbuild";
import { CompileOptions } from "./compile";

export interface PluginOptions {
  artifactDirectory?: string;
  buildCommand?: string;
  condition?: string;
  devMode?: boolean;
  filter?: RegExp;
  module?: "cjs" | "esm";
  suffix?: string;
}

export function setup(
  build: PluginBuild,
  opts: PluginOptions
): { options: Required<PluginOptions>; compileOptions: CompileOptions } {
  const currentCwd = process.cwd();

  let relayConfig: any;
  try {
    process.chdir(build.initialOptions.absWorkingDir);
    relayConfig =
      typeof require === "function" ? require("relay-config").loadConfig() : {};
  } catch (_err) {
  } finally {
    process.chdir(currentCwd);
  }

  relayConfig = Object.assign(
    {
      language: "javascript",
      artifactDirectory: "src/__generated__",
    },
    relayConfig || {}
  );

  let filter: RegExp;
  if (relayConfig.extensions && relayConfig.extensions.length) {
    filter = new RegExp(`/\.(${relayConfig.extensions.join("|")})/`);
  } else if (relayConfig.language == "typescript") {
    filter = /\.(ts|tsx)/;
  } else {
    filter = /\.(js|jsx)/;
  }

  const options = Object.assign({ filter }, opts) as Required<PluginOptions>;
  const compileOptions = Object.assign(
    {
      artifactDirectory: relayConfig.artifactDirectory,
      devMode: process.env.NODE_ENV !== "production",
      module: "esm",
    },
    opts
  );

  return { options, compileOptions };
}
