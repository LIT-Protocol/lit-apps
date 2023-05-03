import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Router from "next/router";
export const LitCard = (prop) => {
    const defaultClass = "lit-card";
    // inject defaultClass into prop.className array
    const newProp = prop.className
        ? Object.assign(Object.assign({}, prop), { className: [...prop.className, ` ${defaultClass}`].join("") }) : Object.assign(Object.assign({}, prop), { className: defaultClass });
    const handleClick = (e) => {
        e.preventDefault();
        Router.push(prop.href);
    };
    return (_jsxs("a", Object.assign({ onClick: handleClick, href: newProp.href }, newProp, { children: [prop.children, _jsx("h3", { children: prop.title }), _jsx("p", { children: prop.description })] })));
};
