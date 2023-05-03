import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LitIcon } from "./LitIcon";
import Router from "next/router";
// turn it to const function
const isAnchor = (props) => {
    return props.href !== undefined;
};
const isIcon = (props) => {
    return props.icon !== undefined;
};
const isRedirect = (props) => {
    return props.redirect !== undefined;
};
export const LitButton = (props) => {
    const handleMouseOver = (e) => {
        const span = e.target.querySelector("span");
        if (!span)
            return;
        span.style.display = "block";
    };
    const handleMouseLeave = (e) => {
        const span = e.target.querySelector("span");
        if (!span)
            return;
        span.style.display = "none";
    };
    if (isRedirect(props)) {
        const redirect = (e) => {
            // console.log(e);
            e.preventDefault();
            Router.push(props.redirect);
        };
        return (_jsx("a", Object.assign({ className: "alink", onClick: redirect, href: props.redirect }, props, { children: props.children })));
    }
    if (isAnchor(props)) {
        return _jsx("a", Object.assign({ className: "lit-button" }, props));
    }
    if (isIcon(props)) {
        const defaultClass = "lit-button-icon";
        const newProp = props.className
            ? Object.assign(Object.assign({}, props), { className: [...props.className, ` ${defaultClass}`].join("") }) : Object.assign(Object.assign({}, props), { className: defaultClass });
        return (_jsxs("button", Object.assign({ type: "button", onMouseOver: handleMouseOver, onMouseLeave: handleMouseLeave }, newProp, { children: [_jsx(LitIcon, { className: "no-pointer", icon: props.icon }), _jsx("span", Object.assign({ className: "" }, { children: props.hovertext }))] })));
    }
    return _jsx("button", Object.assign({ type: "button", className: "lit-button" }, props));
};
