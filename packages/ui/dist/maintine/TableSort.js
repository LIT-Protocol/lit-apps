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
import { useState } from "react";
import { createStyles, Table, ScrollArea, UnstyledButton, Group, Text, Center, TextInput, rem, Button, } from "@mantine/core";
import { keys } from "@mantine/utils";
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch, IconExternalLink, } from "@tabler/icons-react";
var useStyles = createStyles(function (theme) { return ({
    th: {
        padding: "0 !important",
    },
    td: {
        color: "white",
    },
    control: {
        width: "100%",
        padding: "".concat(theme.spacing.xs, " ").concat(theme.spacing.md),
        // "&:hover": {
        //   backgroundColor:
        //     theme.colorScheme === "dark"
        //       ? theme.colors.dark[6]
        //       : theme.colors.gray[0],
        // },
    },
    icon: {
        width: rem(21),
        height: rem(21),
        borderRadius: rem(21),
    },
}); });
function Th(_a) {
    var children = _a.children, reversed = _a.reversed, sorted = _a.sorted, onSort = _a.onSort;
    var classes = useStyles().classes;
    var Icon = sorted
        ? reversed
            ? IconChevronUp
            : IconChevronDown
        : IconSelector;
    return (_jsx("th", __assign({ className: classes.th }, { children: _jsx(UnstyledButton, __assign({ onClick: onSort, className: classes.control }, { children: _jsxs(Group, __assign({ position: "apart" }, { children: [_jsx(Text, __assign({ fw: 500, fz: "sm", color: "#7F53AD" }, { children: children })), _jsx(Center, __assign({ className: classes.icon }, { children: _jsx(Icon, { size: "0.9rem", stroke: 1.5 }) }))] })) })) })));
}
function filterData(data, search) {
    var query = search.toLowerCase().trim();
    return data.filter(function (item) {
        return keys(data[0]).some(function (key) { return item[key].toLowerCase().includes(query); });
    });
}
function sortData(data, payload) {
    var sortBy = payload.sortBy;
    if (!sortBy) {
        return filterData(data, payload.search);
    }
    return filterData(__spreadArray([], data, true).sort(function (a, b) {
        if (payload.reversed) {
            return b[sortBy].localeCompare(a[sortBy]);
        }
        return a[sortBy].localeCompare(b[sortBy]);
    }), payload.search);
}
function Td(_a) {
    var children = _a.children;
    var classes = useStyles().classes;
    return _jsx("td", __assign({ className: classes.td }, { children: children }));
}
export function TableSort(_a) {
    var data = _a.data;
    var _b = useState(""), search = _b[0], setSearch = _b[1];
    var _c = useState(data), sortedData = _c[0], setSortedData = _c[1];
    var _d = useState(null), sortBy = _d[0], setSortBy = _d[1];
    var _e = useState(false), reverseSortDirection = _e[0], setReverseSortDirection = _e[1];
    var setSorting = function (field) {
        var reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedData(sortData(data, { sortBy: field, reversed: reversed, search: search }));
    };
    var handleSearchChange = function (event) {
        var value = event.currentTarget.value;
        setSearch(value);
        setSortedData(sortData(data, { sortBy: sortBy, reversed: reverseSortDirection, search: value }));
    };
    var rows = sortedData.map(function (row) { return (_jsxs("tr", { children: [_jsx(Td, { children: row.name }), _jsx(Td, { children: _jsx(Button, __assign({ component: "a", variant: "gradient", gradient: { from: "#0A142D", to: "#0A142D", deg: 35 }, href: row.path, target: "_blank", radius: 12, leftIcon: _jsx(IconExternalLink, { size: "0.9rem" }) }, { children: "Open in new tab" })) })] }, row.name)); });
    return (_jsxs(ScrollArea, { children: [_jsx(TextInput, { placeholder: "Search by any field", mb: "md", icon: _jsx(IconSearch, { size: "0.9rem", stroke: 1.5 }), value: search, onChange: handleSearchChange }), _jsxs(Table, __assign({ horizontalSpacing: "md", verticalSpacing: "xs", miw: 700, sx: { tableLayout: "fixed" } }, { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx(Th, __assign({ sorted: sortBy === "name", reversed: reverseSortDirection, onSort: function () { return setSorting("name"); } }, { children: "Name" })), _jsx(Th, __assign({ sorted: sortBy === "path", reversed: reverseSortDirection, onSort: function () { return setSorting("path"); } }, { children: "Path" }))] }) }), _jsx("tbody", { children: rows.length > 0 ? (rows) : (_jsx("tr", { children: _jsx("td", __assign({ colSpan: Object.keys(data[0]).length }, { children: _jsx(Text, __assign({ weight: 500, align: "center" }, { children: "Nothing found" })) })) })) })] }))] }));
}
