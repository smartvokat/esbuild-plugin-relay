import * as React from "react";
import * as ReactDOM from "react-dom";
import { RelayEnvironmentProvider } from "react-relay/hooks";
import { Environment, Network, RecordSource, Store } from "relay-runtime";
import { App } from "./App";

async function fetchRelay(params, variables) {
  console.log(
    `Fetching query ${params.name} with ${JSON.stringify(variables)}`
  );

  const response = await fetch("http://localhost:4001/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: params.text,
      variables,
    }),
  });

  return await response.json();
}

const environment = new Environment({
  network: Network.create(fetchRelay),
  store: new Store(new RecordSource()),
});

ReactDOM.render(
  <RelayEnvironmentProvider environment={environment}>
    <React.Suspense fallback={"Loading..."}>
      <App />
    </React.Suspense>
  </RelayEnvironmentProvider>,
  document.getElementById("root")
);
