import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const LitInputTextV1 = (prop) => {
    const defaultClass = "lit-input-v1";
    const newProp = Object.assign(Object.assign({}, prop), { className: "" });
    return (_jsxs("div", Object.assign({ className: `${defaultClass} ${prop.className}` }, { children: [_jsx("label", { children: prop.label }), _jsx("input", Object.assign({ type: "text" }, newProp))] })));
};
