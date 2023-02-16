import MonacoEditor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { LitButton } from "../LitButton";
// @ts-ignore
import DJSON from "dirty-json";
import { useState } from "react";

export const LitEditor = (prop: any) => {
  const defaultClass = "lit-code-editor";

  const editorProp = {
    className: "",

    // some default values
    language: "javascript",
    theme: "vs-dark",
    options: {
      wordWrap: "on",
      fontSize: 10,
      minimap: {
        enabled: true,
      },
    },
    tools: {
      beautifyJson: false,
      wrapCode: false,
    },
    ...prop,
  };

  const [code, setCode] = useState(prop.defaultCode);

  const beautifyJson = () => {
    console.log(code);

    try {
      // @ts-ignore
      setCode(JSON.stringify(DJSON.parse(code), null, 2));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const hasTools = () => {
    // check if any tools are enabled, if so, return true, else return false
    if (editorProp.tools) {
      const tools = Object.keys(editorProp.tools);

      for (let i = 0; i < tools.length; i++) {
        if (editorProp.tools[tools[i]]) {
          return true;
        }
      }

      return false;
    }
  };

  const renderBeautifyButton = () => {
    return (
      <>
        {!editorProp.tools.beautifyJson ? (
          ""
        ) : (
          <div className="flex mb-4">
            <LitButton
              className="lit-button-6 justify-center"
              onClick={beautifyJson}
            >
              Beautify
            </LitButton>
          </div>
        )}
      </>
    );
  };

  // const renderWrapCode = () => {
  //   return (
  //     <>
  //       {!editorProp.tools.wrapCode ? (
  //         ""
  //       ) : (
  //         <div className="flex mb-4">
  //           <LitButton
  //             className="lit-button-6 justify-center"
  //             onClick={beautifyJson}
  //           >
  //             Wrap Code
  //           </LitButton>
  //         </div>
  //       )}
  //     </>
  //   );
  // };

  const renderTools = () => {
    return (
      <>
        {!hasTools() ? (
          ""
        ) : (
          <div className="flex gap-12">
            {renderBeautifyButton()}
            {/* {renderWrapCode()} */}
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`${defaultClass} ${prop.className}`}>
      {prop?.title ? <h1>{prop.title}</h1> : ""}

      <section>
        {renderTools()}
        <MonacoEditor
          value={code}
          {...editorProp}
          onChange={(e: any) => {
            setCode(e);
            if (prop.onChange) {
              prop.onChange(e);
            }
          }}
        />
      </section>
    </div>
  );
};
