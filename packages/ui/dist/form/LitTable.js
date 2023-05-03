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
import { useState } from "react";
import { createStyles, Table, ScrollArea, rem } from "@mantine/core";
import React from "react";
var useStyles = createStyles(function (theme) { return ({
    header: {
        position: "sticky",
        top: 0,
        backgroundColor: theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
        transition: "box-shadow 150ms ease",
        "&::after": {
            content: '""',
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            borderBottom: "".concat(rem(1), " solid ").concat(theme.colorScheme === "dark"
                ? theme.colors.dark[3]
                : theme.colors.gray[2]),
        },
    },
    scrolled: {
        boxShadow: theme.shadows.sm,
    },
}); });
export function LitTable(_a) {
    var _b;
    var data = _a.data, renderRow = _a.renderRow, headers = _a.headers;
    var _c = useStyles(), classes = _c.classes, cx = _c.cx;
    var _d = useState(false), scrolled = _d[0], setScrolled = _d[1];
    var rows = data.map(function (row, index) { return (_jsx(React.Fragment, { children: renderRow(row, index) }, index)); });
    var headerCells = headers.map(function (header, index) { return (_jsx("th", { children: header }, index)); });
    return (_jsx(ScrollArea, __assign({ onScrollPositionChange: function (_a) {
            var y = _a.y;
            return setScrolled(y !== 0);
        } }, { children: _jsxs(Table, __assign({ miw: 700 }, { children: [_jsx("thead", __assign({ className: cx(classes.header, (_b = {}, _b[classes.scrolled] = scrolled, _b)) }, { children: _jsx("tr", { children: headerCells }) })), _jsx("tbody", { children: rows })] })) })));
}
