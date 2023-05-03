# Getting started

```
yarn add @getlit/hooks
```

# usePKPs

usePKPs is a custom hook that fetches Public Key Pages (PKPs) data and returns
the data, loading, and error states along with a render function for default rendering, and
a start function to initiate fetching.

![](https://raw.githubusercontent.com/LIT-Protocol/lit-apps/8e1dd9c267c8d7a9bbb8cae312215dd9dabd40ac/gifs/usePKPs.gif)

## react usage

```js
import { usePKPs } from "@getlit/hooks";

export default function Home() {
  const [data, loading, errors, fetch, defaultRender] = usePKPs({
    litNetwork: "serrano",
    chain: "ethereum",
  });

  return (
    <>
      <button onClick={fetch}>View PKPs</button>

      {/* -- default render -- */}
      <h2>Default rendering</h2>
      {defaultRender((pkp: any) => {
        console.log(pkp);
      })}

      {/* -- custom render */}
      <h2>Custom rendering</h2>
      {loading ? "Loading PKPs..." : ""}
      {errors ? "Error: " + errors : ""}
      {data?.map((pkp: any) => {
        return (
          <div key={pkp.tokenId}>
            tokenId: {pkp.tokenId} <br />
          </div>
        );
      })}
    </>
  );
}
```

## html usage

```html
<body>
  <div id="root"></div>

  <button id="btn-view-pkps">View PKPs</button>

  <!-- script -->
  <script
    crossorigin
    src="https://unpkg.com/react/umd/react.production.min.js"
  ></script>
  <script
    crossorigin
    src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"
  ></script>
  <script src="https://www.unpkg.com/@getlit/hooks@0.0.12/dist/bundle.umd.js"></script>
  <script>
    const { usePKPs } = GetLitHooks;

    function YourComponent() {
      const [data, loading, error, fetchPKPs, render] = usePKPs({
        litNetwork: "serrano",
        chain: "ethereum",
      });

      document.getElementById("btn-view-pkps").onclick = async () => {
        fetchPKPs();
      };
      return React.createElement(
        "div",
        null,
        render((pkp) => {
          console.log(pkp);
        })
      );
    }

    ReactDOM.render(
      React.createElement(YourComponent, null),
      document.getElementById("root")
    );
  </script>
</body>
```
