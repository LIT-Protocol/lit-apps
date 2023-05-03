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
import { LitButton } from "./LitButton";
import { LitConnect } from "./LitConnect";
import { LitIcon } from "./LitIcon";
import Router from "next/router";
import { useEffect, useState } from "react";
export var LitHeaderV1 = function (_a) {
    var title = _a.title, children = _a.children;
    var _b = useState("/"), currentPath = _b[0], setCurrentPath = _b[1];
    var navItems = [
        {
            route: "/",
            name: "Apps",
        },
        {
            route: "/tasks",
            name: "Tasks",
        },
    ];
    useEffect(function () {
        var pathname = Router.pathname;
        setCurrentPath(pathname);
    });
    return (_jsxs("div", __assign({ className: "lit-header flex space-between center-item" }, { children: [_jsx(LitButton, __assign({ redirect: "/" }, { children: _jsxs("div", __assign({ className: "flex gap-12" }, { children: [_jsx(LitIcon, { icon: "lit-logo", width: "100", className: "header-logo" }), _jsx("div", __assign({ className: "flex center-item" }, { children: _jsx("h3", { children: title }) }))] })) })), _jsx("ul", __assign({ className: "lit-nav-middle flex" }, { children: navItems.map(function (item, index) {
                    return (_jsx(LitButton, __assign({ className: "lit-link animate ".concat(currentPath == item.route ? "active" : ""), redirect: item.route }, { children: item.name }), index));
                }) })), _jsx(LitConnect, {})] })));
};
