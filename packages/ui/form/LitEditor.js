import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import MonacoEditor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { LitButton } from "../LitButton";
// @ts-ignore
import DJSON from "dirty-json";
import { useState } from "react";
export const LitEditor = (prop) => {
    const defaultClass = "lit-code-editor";
    const editorProp = Object.assign({ className: "", 
        // some default values
        language: "javascript", theme: "vs-dark", options: {
            wordWrap: "on",
            fontSize: 10,
            minimap: {
                enabled: true,
            },
        }, tools: {
            beautifyJson: false,
            wrapCode: false,
        } }, prop);
    const [code, setCode] = useState(prop.defaultCode);
    const beautifyJson = () => {
        console.log(code);
        try {
            // @ts-ignore
            setCode(JSON.stringify(DJSON.parse(code), null, 2));
        }
        catch (e) {
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
        return (_jsx(_Fragment, { children: !editorProp.tools.beautifyJson ? ("") : (_jsx("div", Object.assign({ className: "flex mb-4" }, { children: _jsx(LitButton, Object.assign({ className: "lit-button-6 justify-center", onClick: beautifyJson }, { children: "Beautify" })) }))) }));
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
        return (_jsx(_Fragment, { children: !hasTools() ? ("") : (_jsx("div", Object.assign({ className: "flex gap-12" }, { children: renderBeautifyButton() }))) }));
    };
    return (_jsxs("div", Object.assign({ className: `${defaultClass} ${prop.className}` }, { children: [(prop === null || prop === void 0 ? void 0 : prop.title) ? _jsx("h1", { children: prop.title }) : "", _jsxs("section", { children: [renderTools(), _jsx(MonacoEditor, Object.assign({ value: code }, editorProp, { onChange: (e) => {
                            setCode(e);
                            if (prop.onChange) {
                                prop.onChange(e);
                            }
                        } }))] })] })));
};
