import { jsx as _jsx } from "react/jsx-runtime";
export const LitNote = (prop) => {
    const defaultClass = "lit-note";
    // inject defaultClass into prop.className array
    const newProp = prop.className
        ? Object.assign(Object.assign({}, prop), { className: [...prop.className, ` ${defaultClass}`].join("") }) : Object.assign(Object.assign({}, prop), { className: defaultClass });
    return _jsx("div", Object.assign({}, newProp));
};
