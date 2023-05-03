import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const DivWithTitle = (prop) => {
    const defaultClass = "div-with-title";
    return (_jsxs("div", Object.assign({ className: `${defaultClass}` }, { children: [_jsx("h1", Object.assign({ className: `${!prop.title ? "invisible" : ""}` }, { children: !prop.title ? "*" : prop.title })), _jsx("section", { children: prop.children })] })));
};
