import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const LitHero = (prop) => {
    const defaultClass = "lit-hero";
    // inject defaultClass into prop.className array
    const newProp = prop.className
        ? Object.assign(Object.assign({}, prop), { className: [...prop.className, ` ${defaultClass}`].join("") }) : Object.assign(Object.assign({}, prop), { className: defaultClass });
    return (_jsxs("section", Object.assign({}, newProp, { children: [_jsx("h1", { children: newProp.title }), _jsx("p", { children: newProp.description })] })));
};
