import { setup } from "../setup";
import * as path from "path";

const fixtures = path.join(process.cwd(), "src", "__tests__", "fixtures");

test("use relay-config to automatically detect configuration", () => {
  const { options, compileOptions } = setup(
    {
      initialOptions: {
        absWorkingDir: path.join(fixtures, "relay-config-file"),
      },
    } as any,
    {}
  );

  expect(options.filter.toString()).toBe("/\\/.(js)\\//");
  expect(compileOptions.artifactDirectory).toBe("src/__graphql__");
});

test("use relay-config to automatically detect TypeScript configuration", () => {
  const { options, compileOptions } = setup(
    {
      initialOptions: {
        absWorkingDir: path.join(fixtures, "relay-config-typescript"),
      },
    } as any,
    {}
  );

  expect(options.filter.toString()).toBe("/\\.(ts|tsx)/");
  expect(compileOptions.artifactDirectory).toBe("src/__generated__");
});
