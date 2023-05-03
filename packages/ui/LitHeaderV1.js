import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LitButton } from "./LitButton";
import { LitConnect } from "./LitConnect";
import { LitIcon } from "./LitIcon";
import Router from "next/router";
import { useEffect, useState } from "react";
export const LitHeaderV1 = ({ title, children, }) => {
    const [currentPath, setCurrentPath] = useState("/");
    const navItems = [
        {
            route: "/",
            name: "Apps",
        },
        {
            route: "/tasks",
            name: "Tasks",
        },
    ];
    useEffect(() => {
        const { pathname } = Router;
        setCurrentPath(pathname);
    });
    return (_jsxs("div", Object.assign({ className: "lit-header flex space-between center-item" }, { children: [_jsx(LitButton, Object.assign({ redirect: "/" }, { children: _jsxs("div", Object.assign({ className: "flex gap-12" }, { children: [_jsx(LitIcon, { icon: "lit-logo", width: "100", className: "header-logo" }), _jsx("div", Object.assign({ className: "flex center-item" }, { children: _jsx("h3", { children: title }) }))] })) })), _jsx("ul", Object.assign({ className: "lit-nav-middle flex" }, { children: navItems.map((item, index) => {
                    return (_jsx(LitButton, Object.assign({ className: `lit-link animate ${currentPath == item.route ? "active" : ""}`, redirect: item.route }, { children: item.name }), index));
                }) })), _jsx(LitConnect, {})] })));
};
