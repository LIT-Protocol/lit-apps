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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import React from "react";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import classNames from "classnames";
import { CaretDownIcon } from "@radix-ui/react-icons";
export var LitNavMenu = function () {
    return (_jsxs(NavigationMenu.Root, __assign({ className: "NavigationMenuRoot" }, { children: [_jsxs(NavigationMenu.List, __assign({ className: "NavigationMenuList" }, { children: [_jsxs(NavigationMenu.Item, { children: [_jsxs(NavigationMenu.Trigger, __assign({ className: "NavigationMenuTrigger" }, { children: ["Learn ", _jsx(CaretDownIcon, { className: "CaretDown", "aria-hidden": true })] })), _jsx(NavigationMenu.Content, __assign({ className: "NavigationMenuContent" }, { children: _jsxs("ul", __assign({ className: "List one" }, { children: [_jsx("li", __assign({ style: { gridRow: "span 3" } }, { children: _jsx(NavigationMenu.Link, __assign({ asChild: true }, { children: _jsxs("a", __assign({ className: "Callout", href: "/" }, { children: [_jsxs("svg", __assign({ "aria-hidden": true, width: "38", height: "38", viewBox: "0 0 25 25", fill: "white" }, { children: [_jsx("path", { d: "M12 25C7.58173 25 4 21.4183 4 17C4 12.5817 7.58173 9 12 9V25Z" }), _jsx("path", { d: "M12 0H4V8H12V0Z" }), _jsx("path", { d: "M17 8C19.2091 8 21 6.20914 21 4C21 1.79086 19.2091 0 17 0C14.7909 0 13 1.79086 13 4C13 6.20914 14.7909 8 17 8Z" })] })), _jsx("div", __assign({ className: "CalloutHeading" }, { children: "Radix Primitives" })), _jsx("p", __assign({ className: "CalloutText" }, { children: "Unstyled, accessible components for React." }))] })) })) })), _jsx(ListItem, __assign({ href: "https://stitches.dev/", title: "Stitches" }, { children: "CSS-in-JS with best-in-class developer experience." })), _jsx(ListItem, __assign({ href: "/colors", title: "Colors" }, { children: "Beautiful, thought-out palettes with auto dark mode." })), _jsx(ListItem, __assign({ href: "https://icons.radix-ui.com/", title: "Icons" }, { children: "A crisp set of 15x15 icons, balanced and consistent." }))] })) }))] }), _jsxs(NavigationMenu.Item, { children: [_jsxs(NavigationMenu.Trigger, __assign({ className: "NavigationMenuTrigger" }, { children: ["Overview ", _jsx(CaretDownIcon, { className: "CaretDown", "aria-hidden": true })] })), _jsx(NavigationMenu.Content, __assign({ className: "NavigationMenuContent" }, { children: _jsxs("ul", __assign({ className: "List two" }, { children: [_jsx(ListItem, __assign({ title: "Introduction", href: "/docs/primitives/overview/introduction" }, { children: "Build high-quality, accessible design systems and web apps." })), _jsx(ListItem, __assign({ title: "Getting started", href: "/docs/primitives/overview/getting-started" }, { children: "A quick tutorial to get you up and running with Radix Primitives." })), _jsx(ListItem, __assign({ title: "Styling", href: "/docs/primitives/overview/styling" }, { children: "Unstyled and compatible with any styling solution." })), _jsx(ListItem, __assign({ title: "Animation", href: "/docs/primitives/overview/animation" }, { children: "Use CSS keyframes or any animation library of your choice." })), _jsx(ListItem, __assign({ title: "Accessibility", href: "/docs/primitives/overview/accessibility" }, { children: "Tested in a range of browsers and assistive technologies." })), _jsx(ListItem, __assign({ title: "Releases", href: "/docs/primitives/overview/releases" }, { children: "Radix Primitives releases and their changelogs." }))] })) }))] }), _jsx(NavigationMenu.Item, { children: _jsx(NavigationMenu.Link, __assign({ className: "NavigationMenuLink", href: "https://github.com/radix-ui" }, { children: "Github" })) }), _jsx(NavigationMenu.Indicator, __assign({ className: "NavigationMenuIndicator" }, { children: _jsx("div", { className: "Arrow" }) }))] })), _jsx("div", __assign({ className: "ViewportPosition" }, { children: _jsx(NavigationMenu.Viewport, { className: "NavigationMenuViewport" }) }))] })));
};
var ListItem = React.forwardRef(function (_a, forwardedRef) {
    var className = _a.className, children = _a.children, title = _a.title, props = __rest(_a, ["className", "children", "title"]);
    return (_jsx("li", { children: _jsx(NavigationMenu.Link, __assign({ asChild: true }, { children: _jsxs("a", __assign({ className: classNames("ListItemLink", className) }, props, { ref: forwardedRef }, { children: [_jsx("div", __assign({ className: "ListItemHeading" }, { children: title })), _jsx("p", __assign({ className: "ListItemText" }, { children: children }))] })) })) }));
});
