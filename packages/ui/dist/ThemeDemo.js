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
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrandLogo } from "./BrandLogo";
// import "./theme.demo.css";
import Editor from "@monaco-editor/react";
// export with children
export var ThemeDemo = function (_a) {
    var children = _a.children, className = _a.className, pageInfo = _a.pageInfo, editorInfo = _a.editorInfo, onEditorReady = _a.onEditorReady;
    function handleEditorWillMount(monaco) {
        // here is the monaco instance
        // do something before editor is mounted
        monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        });
    }
    function handleEditorDidMount(editor, monaco) {
        if (onEditorReady) {
            onEditorReady(editor, monaco);
        }
    }
    return (_jsxs("div", __assign({ className: "".concat(className !== null && className !== void 0 ? className : "", " App") }, { children: [_jsxs("header", __assign({ className: "App-header" }, { children: [_jsx(BrandLogo, {}), _jsx("h2", __assign({ className: "my-12" }, { children: pageInfo.title })), _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Dependencies" }), _jsx("th", { children: "Version" })] }) }), _jsx("tbody", { children: pageInfo.litDependencies.map(function (item) { return (_jsxs("tr", { children: [_jsx("td", { children: _jsx("a", __assign({ target: "_blank", href: "https://www.npmjs.com/package/".concat(item.name) }, { children: item.name })) }), _jsx("td", { children: item.version })] }, item.name)); }) })] }), _jsx("div", __assign({ className: "flex flex-col" }, { children: children }))] })), _jsx("div", __assign({ className: "editor" }, { children: _jsx(Editor, { theme: "vs-dark", height: "100vh", language: editorInfo.lang, value: editorInfo.lang === "json"
                        ? JSON.stringify(editorInfo.code, null, 2)
                        : editorInfo.code, options: {
                        wordWrap: "on",
                    }, beforeMount: handleEditorWillMount, onMount: handleEditorDidMount }) }))] })));
};
