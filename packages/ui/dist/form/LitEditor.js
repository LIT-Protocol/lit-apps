var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import MonacoEditor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { LitButton } from "../LitButton";
// @ts-ignore
import DJSON from "dirty-json";
import { useState } from "react";
export var LitEditor = function (prop) {
    var defaultClass = "lit-code-editor";
    var editorProp = __assign({ className: "", 
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
    var _a = useState(prop.defaultCode), code = _a[0], setCode = _a[1];
    var beautifyJson = function () {
        console.log(code);
        try {
            // @ts-ignore
            setCode(JSON.stringify(DJSON.parse(code), null, 2));
        }
        catch (e) {
            toast.error(e.message);
        }
    };
    var hasTools = function () {
        // check if any tools are enabled, if so, return true, else return false
        if (editorProp.tools) {
            var tools = Object.keys(editorProp.tools);
            for (var i = 0; i < tools.length; i++) {
                if (editorProp.tools[tools[i]]) {
                    return true;
                }
            }
            return false;
        }
    };
    var renderBeautifyButton = function () {
        return (_jsx(_Fragment, { children: !editorProp.tools.beautifyJson ? ("") : (_jsx("div", __assign({ className: "flex mb-4" }, { children: _jsx(LitButton, __assign({ className: "lit-button-6 justify-center", onClick: beautifyJson }, { children: "Beautify" })) }))) }));
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
    var renderTools = function () {
        return (_jsx(_Fragment, { children: !hasTools() ? ("") : (_jsx("div", __assign({ className: "flex gap-12" }, { children: renderBeautifyButton() }))) }));
    };
    return (_jsxs("div", __assign({ className: "".concat(defaultClass, " ").concat(prop.className) }, { children: [(prop === null || prop === void 0 ? void 0 : prop.title) ? _jsx("h1", { children: prop.title }) : "", _jsxs("section", { children: [renderTools(), _jsx(MonacoEditor, __assign({ value: code }, editorProp, { onChange: function (e) {
                            setCode(e);
                            if (prop.onChange) {
                                prop.onChange(e);
                            }
                        } }))] })] })));
};
