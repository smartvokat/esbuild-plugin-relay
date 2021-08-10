import { print, parse } from "graphql";
import * as crypto from "crypto";
import * as path from "path";

export interface CompileOptions {
  artifactDirectory: string;
  condition?: string;
  devMode?: boolean;
  module?: "cjs" | "esm";
  suffix?: string;
  buildCommand?: string;
}

const defaultOptions: Partial<CompileOptions> = {
  condition: "",
  devMode: false,
  module: "esm",
  suffix: "",
  buildCommand: "relay-compiler",
};

export function compile(
  file: string,
  contents: string,
  opts: CompileOptions
): string {
  opts = Object.assign({}, defaultOptions, opts) as Required<CompileOptions>;

  const imports: string[] = [];

  contents = contents.replace(/graphql`([\s\S]*?)`/gm, (_match, query) => {
    const ast = parse(query);

    if (ast.definitions.length === 0) {
      throw new Error("Unexpected empty graphql tag.");
    }

    const definition = ast.definitions[0];
    if (
      definition.kind !== "FragmentDefinition" &&
      definition.kind !== "OperationDefinition"
    ) {
      throw new Error(
        "Expected a fragment, mutation, query, or " +
          "subscription, got `" +
          definition.kind +
          "`."
      );
    }

    const name = definition.name && definition.name.value;
    if (!name) {
      throw new Error("GraphQL operations and fragments must contain names");
    }

    const hash = crypto
      .createHash("md5")
      .update(print(definition), "utf8")
      .digest("hex");

    const id = `graphql__${hash}`;
    const importFile = `${name}.graphql${opts.suffix}`;
    const importPath = getRelativeImportPath(
      file,
      opts.artifactDirectory,
      importFile
    );

    let result = id;

    if (opts.module === "esm") {
      imports.push(`import ${id} from "${importPath}";`);
    } else {
      result = `require("${importPath}")`;
    }

    if (opts.devMode) {
      const error = getErrorMessage(name, opts.buildCommand);
      const condition = opts.condition ? `${opts.condition} && ` : "";

      if (opts.module === "cjs") {
        result =
          `${id} !== void 0 ? ${id} : (${id} = ${result}, ${condition}${id}.hash && ` +
          `${id}.hash !== "${hash}" && console.error("${error}"), ${id})`;
      } else if (opts.module == "esm") {
        result =
          `(${condition}${id}.hash && ${id}.hash !== "${hash}" && ` +
          `console.error("${error}"), ${id})`;
      }
    }

    return result;
  });

  return (imports.length > 0 ? `${imports.join("\n")}\n` : "") + contents;
}

function getErrorMessage(name: string, buildCommand: string) {
  return (
    `The definition of '${name}' appears to have changed. Run \`${buildCommand}\` to ` +
    `update the generated files to receive the expected data.`
  );
}

function getRelativeImportPath(
  fileName: string,
  artifactDirectory: string,
  fileToRequire: string
): string {
  const relative = path.relative(
    path.dirname(fileName),
    path.resolve(artifactDirectory)
  );

  const relativeReference =
    relative.length === 0 || !relative.startsWith(".") ? "./" : "";

  return relativeReference + path.join(relative, fileToRequire);
}
