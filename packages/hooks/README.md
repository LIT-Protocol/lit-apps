# usePKPs (UMD) example

```html
<body>
  <div id="root"></div>

  <button id="btn-view-pkps">View PKPs</button>

  <!-- script -->
  <script crossorigin src="https://unpkg.com/react/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
  <script src="./dist/bundle.umd.js"></script>
  <script>
    const { usePKPs } = GetLitHooks;

    function YourComponent() {
      const [data, loading, error, fetchPKPs, render] = usePKPs({ litNetwork: "serrano", chain: "ethereum" });

      document.getElementById('btn-view-pkps').onclick = async () => {
        fetchPKPs();
      };
      
      return React.createElement('div', null, render((pkp) => {
        console.log(pkp);
      }));
    }

    ReactDOM.render(
      React.createElement(YourComponent, null),
      document.getElementById('root')
    );
  </script>
</body>
```