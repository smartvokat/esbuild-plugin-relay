import { compile } from "../compile";

test("handles fragments", () => {
  const code = compile(
    "./src/test.ts",
    "graphql`fragment TestFrag on Node { id }`",
    { artifactDirectory: "./src/__generated__" }
  );

  expect(code).toMatchSnapshot();
});

test("handles queries", () => {
  const code = compile(
    "./test/some/nested/folder/file.ts",
    "graphql`query SomeQuery($id: ID!) { node(id: $id) { id }}`",
    { artifactDirectory: "./src/__generated__" }
  );

  expect(code).toMatchSnapshot();
});

test("handles mutations", () => {
  const code = compile(
    "../another/folder/file.js",
    "graphql`mutation CreateUser($name: String!) { createUser(name: $name) { id }}`",
    { artifactDirectory: "./__generated__" }
  );

  expect(code).toMatchSnapshot();
});

test("handles subscriptions", () => {
  const code = compile(
    "../another/folder/file.js",
    "graphql`subscription FeedbackLikeSubscription { likes }`",
    { artifactDirectory: "./__generated__" }
  );

  expect(code).toMatchSnapshot();
});

test("fail on nameless operation", () => {
  expect(() => {
    compile("./src/test.ts", "graphql`{ node { id }}`", {
      artifactDirectory: "./src/__generated__",
    });
  }).toThrowError("GraphQL operations and fragments must contain names");
});

describe("with ESM modules", () => {
  test("handles fragments", () => {
    const code = compile(
      "./src/test.ts",
      "graphql`fragment TestFrag on Node { id }`",
      { artifactDirectory: "./src/__generated__" }
    );

    expect(code).toMatchSnapshot();
  });

  test("handles multiple tagged template literals", () => {
    const code = `
  /**
   * Copyright (c) Example Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  'use strict';

  import { graphql } from "react-relay/hooks";

  const someQuery = graphql\`
    query SomeQuery($id: ID!) {
      node(id: $id) { id }
    }
  \`;

  const anotherQuery = graphql\`
    query AnotherQuery($id: ID!) {
      node(id: $id) { id }
    }
  \`;`;

    expect(
      compile("./src/some/file.js", code, {
        artifactDirectory: "__graphql__",
      })
    ).toMatchSnapshot();
  });

  test("handles inline tagged template literals", () => {
    const code = `
  function SomeComponent() {
    const _graphql = {};
    const graphql = {};
    const graphql_ = "graphql";

    return (
      <View>
        <QueryRenderer
          environment={RelayEnvironment}
          variables={{id: '12345'}}
          query={graphql\`
            query AnotherQuery($id: ID!) {
              node(id: $id) { id }
            }
          \`}
        />
      </View>
    );
  }`;

    expect(
      compile("./src/components/SomeComponent.js", code, {
        suffix: ".js",
        artifactDirectory: "../assets/graphql",
      })
    ).toMatchSnapshot();
  });
});

describe("with CommonJS modules", () => {
  test("handles multiple tagged template literals", () => {
    const code = `
  /**
   * Copyright (c) Example Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  'use strict';

  import { graphql } from "react-relay/hooks";

  const someQuery = graphql\`
    query SomeQuery($id: ID!) {
      node(id: $id) { id }
    }
  \`;

  const anotherQuery = graphql\`
    query AnotherQuery($id: ID!) {
      node(id: $id) { id }
    }
  \`;`;

    expect(
      compile("./src/some/file.js", code, {
        module: "cjs",
        artifactDirectory: "__graphql__",
      })
    ).toMatchSnapshot();
  });

  test("handles inline tagged template literals", () => {
    const code = `
  function SomeComponent() {
    const _graphql = {};
    const graphql = {};
    const graphql_ = "graphql";

    return (
      <View>
        <QueryRenderer
          environment={RelayEnvironment}
          variables={{id: '12345'}}
          query={graphql\`
            query AnotherQuery($id: ID!) {
              node(id: $id) { id }
            }
          \`}
        />
      </View>
    );
  }`;

    expect(
      compile("./src/components/SomeComponent.js", code, {
        module: "cjs",
        suffix: ".js",
        artifactDirectory: "../assets/graphql",
      })
    ).toMatchSnapshot();
  });
});

describe("with enabled development mode", () => {
  test("compares the hash in an ESM module", () => {
    const code = compile(
      "src/file.js",
      `
    /**
     * Copyright (c) Example Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    'use strict';

    const {graphql} = require('relay-runtime');

    const fragment = graphql\`
      fragment AFragment on User {
        id
      }
    \`;
    `,
      { artifactDirectory: "./src/__generated__", devMode: true }
    );

    expect(code).toMatchSnapshot();
  });

  test("compares the hash in an ESM module with a custom condition", () => {
    const code = compile(
      "src/nested/dir/component.js",
      `
  function Component() {
    useLazyQuery(graphql\`
    query Query {
      id
    }
  \`);
  }
    `,
      {
        artifactDirectory: "./src/__generated__",
        devMode: true,
        condition: 'process.env.NODE_ENV !== "production"',
      }
    );

    expect(code).toMatchSnapshot();
  });

  test("compares the hash in a CJS module", () => {
    const code = compile(
      "src/file.js",
      `
    /**
     * Copyright (c) Example Inc.
     *
     * This source code is licensed under the MIT license found in the
     * LICENSE file in the root directory of this source tree.
     */

    'use strict';

    const {graphql} = require('relay-runtime');

    const fragment = graphql\`
      fragment AFragment on User {
        id
      }
    \`;
    `,
      { artifactDirectory: "./src/__generated__", devMode: true, module: "cjs" }
    );

    expect(code).toMatchSnapshot();
  });

  test("compares the hash in a CJS module with a custom condition", () => {
    const code = compile(
      "build/file.js",
      `
      fetchQuery<AppQuery>(
        environment,
        graphql\`
          query AppQuery($id: ID!) {
            user(id: $id) {
              name
            }
          }
        \`,
        {id: 4},
      )
      .subscribe({
        start: console.log,
        complete: console.log,
        error: console.log,
        next: console.log
      });
    `,
      {
        artifactDirectory: "./src/__generated__",
        devMode: true,
        module: "cjs",
        condition: "IS_DEV == true",
      }
    );

    expect(code).toMatchSnapshot();
  });
});
