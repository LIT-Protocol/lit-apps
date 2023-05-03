import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { createStyles, Table, ScrollArea, rem } from "@mantine/core";
import React from "react";
const useStyles = createStyles((theme) => ({
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
            borderBottom: `${rem(1)} solid ${theme.colorScheme === "dark"
                ? theme.colors.dark[3]
                : theme.colors.gray[2]}`,
        },
    },
    scrolled: {
        boxShadow: theme.shadows.sm,
    },
}));
export function LitTable({ data, renderRow, headers }) {
    const { classes, cx } = useStyles();
    const [scrolled, setScrolled] = useState(false);
    const rows = data.map((row, index) => (_jsx(React.Fragment, { children: renderRow(row, index) }, index)));
    const headerCells = headers.map((header, index) => (_jsx("th", { children: header }, index)));
    return (_jsx(ScrollArea, Object.assign({ onScrollPositionChange: ({ y }) => setScrolled(y !== 0) }, { children: _jsxs(Table, Object.assign({ miw: 700 }, { children: [_jsx("thead", Object.assign({ className: cx(classes.header, { [classes.scrolled]: scrolled }) }, { children: _jsx("tr", { children: headerCells }) })), _jsx("tbody", { children: rows })] })) })));
}
