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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LitIcon } from "./LitIcon";
import Router from "next/router";
// turn it to const function
var isAnchor = function (props) {
    return props.href !== undefined;
};
var isIcon = function (props) {
    return props.icon !== undefined;
};
var isRedirect = function (props) {
    return props.redirect !== undefined;
};
export var LitButton = function (props) {
    var handleMouseOver = function (e) {
        var span = e.target.querySelector("span");
        if (!span)
            return;
        span.style.display = "block";
    };
    var handleMouseLeave = function (e) {
        var span = e.target.querySelector("span");
        if (!span)
            return;
        span.style.display = "none";
    };
    if (isRedirect(props)) {
        var redirect = function (e) {
            // console.log(e);
            e.preventDefault();
            Router.push(props.redirect);
        };
        return (_jsx("a", __assign({ className: "alink", onClick: redirect, href: props.redirect }, props, { children: props.children })));
    }
    if (isAnchor(props)) {
        return _jsx("a", __assign({ className: "lit-button" }, props));
    }
    if (isIcon(props)) {
        var defaultClass = "lit-button-icon";
        var newProp = props.className
            ? __assign(__assign({}, props), { className: __spreadArray(__spreadArray([], props.className, true), [" ".concat(defaultClass)], false).join("") }) : __assign(__assign({}, props), { className: defaultClass });
        return (_jsxs("button", __assign({ type: "button", onMouseOver: handleMouseOver, onMouseLeave: handleMouseLeave }, newProp, { children: [_jsx(LitIcon, { className: "no-pointer", icon: props.icon }), _jsx("span", __assign({ className: "" }, { children: props.hovertext }))] })));
    }
    return _jsx("button", __assign({ type: "button", className: "lit-button" }, props));
};
