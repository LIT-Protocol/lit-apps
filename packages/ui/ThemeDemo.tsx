import { BrandLogo } from "./BrandLogo";
// import "./theme.demo.css";
import Editor from "@monaco-editor/react";

// export with children
export const ThemeDemo = ({
  children,
  className,
  pageInfo,
  editorInfo,
}: {
  children: JSX.Element | JSX.Element[];
  className?: string;
  pageInfo: any;
  editorInfo: {
    lang: string;
    code: any;
  };
}) => {
  function handleEditorWillMount(monaco: any) {
    // here is the monaco instance
    // do something before editor is mounted
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
  }

  return (
    <div className={`${className ?? ""} App`}>
      <header className="App-header">
        <BrandLogo />
        <h2 className="my-12">{pageInfo.title}</h2>
        <table>
          <thead>
            <tr>
              <th>Dependencies</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            {pageInfo.litDependencies.map((item: any) => (
              <tr key={item.name}>
                <td>
                  <a
                    target="_blank"
                    href={`https://www.npmjs.com/package/${item.name}`}
                  >
                    {item.name}
                  </a>
                </td>
                <td>{item.version}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col">{children}</div>
      </header>

      <div className="editor">
        <Editor
          theme="vs-dark"
          height="100vh"
          language={editorInfo.lang}
          value={
            editorInfo.lang === "json"
              ? JSON.stringify(editorInfo.code, null, 2)
              : editorInfo.code
          }
          options={{
            wordWrap: "on",
          }}
          beforeMount={handleEditorWillMount}
        />
      </div>
    </div>
  );
};
