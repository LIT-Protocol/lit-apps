import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { createStyles, Table, ScrollArea, UnstyledButton, Group, Text, Center, TextInput, rem, Button, } from "@mantine/core";
import { keys } from "@mantine/utils";
import { IconSelector, IconChevronDown, IconChevronUp, IconSearch, IconExternalLink, } from "@tabler/icons-react";
const useStyles = createStyles((theme) => ({
    th: {
        padding: "0 !important",
    },
    td: {
        color: "white",
    },
    control: {
        width: "100%",
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
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
}));
function Th({ children, reversed, sorted, onSort }) {
    const { classes } = useStyles();
    const Icon = sorted
        ? reversed
            ? IconChevronUp
            : IconChevronDown
        : IconSelector;
    return (_jsx("th", Object.assign({ className: classes.th }, { children: _jsx(UnstyledButton, Object.assign({ onClick: onSort, className: classes.control }, { children: _jsxs(Group, Object.assign({ position: "apart" }, { children: [_jsx(Text, Object.assign({ fw: 500, fz: "sm", color: "#7F53AD" }, { children: children })), _jsx(Center, Object.assign({ className: classes.icon }, { children: _jsx(Icon, { size: "0.9rem", stroke: 1.5 }) }))] })) })) })));
}
function filterData(data, search) {
    const query = search.toLowerCase().trim();
    return data.filter((item) => keys(data[0]).some((key) => item[key].toLowerCase().includes(query)));
}
function sortData(data, payload) {
    const { sortBy } = payload;
    if (!sortBy) {
        return filterData(data, payload.search);
    }
    return filterData([...data].sort((a, b) => {
        if (payload.reversed) {
            return b[sortBy].localeCompare(a[sortBy]);
        }
        return a[sortBy].localeCompare(b[sortBy]);
    }), payload.search);
}
function Td({ children }) {
    const { classes } = useStyles();
    return _jsx("td", Object.assign({ className: classes.td }, { children: children }));
}
export function TableSort({ data }) {
    const [search, setSearch] = useState("");
    const [sortedData, setSortedData] = useState(data);
    const [sortBy, setSortBy] = useState(null);
    const [reverseSortDirection, setReverseSortDirection] = useState(false);
    const setSorting = (field) => {
        const reversed = field === sortBy ? !reverseSortDirection : false;
        setReverseSortDirection(reversed);
        setSortBy(field);
        setSortedData(sortData(data, { sortBy: field, reversed, search }));
    };
    const handleSearchChange = (event) => {
        const { value } = event.currentTarget;
        setSearch(value);
        setSortedData(sortData(data, { sortBy, reversed: reverseSortDirection, search: value }));
    };
    const rows = sortedData.map((row) => (_jsxs("tr", { children: [_jsx(Td, { children: row.name }), _jsx(Td, { children: _jsx(Button, Object.assign({ component: "a", variant: "gradient", gradient: { from: "#0A142D", to: "#0A142D", deg: 35 }, href: row.path, target: "_blank", radius: 12, leftIcon: _jsx(IconExternalLink, { size: "0.9rem" }) }, { children: "Open in new tab" })) })] }, row.name)));
    return (_jsxs(ScrollArea, { children: [_jsx(TextInput, { placeholder: "Search by any field", mb: "md", icon: _jsx(IconSearch, { size: "0.9rem", stroke: 1.5 }), value: search, onChange: handleSearchChange }), _jsxs(Table, Object.assign({ horizontalSpacing: "md", verticalSpacing: "xs", miw: 700, sx: { tableLayout: "fixed" } }, { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx(Th, Object.assign({ sorted: sortBy === "name", reversed: reverseSortDirection, onSort: () => setSorting("name") }, { children: "Name" })), _jsx(Th, Object.assign({ sorted: sortBy === "path", reversed: reverseSortDirection, onSort: () => setSorting("path") }, { children: "Path" }))] }) }), _jsx("tbody", { children: rows.length > 0 ? (rows) : (_jsx("tr", { children: _jsx("td", Object.assign({ colSpan: Object.keys(data[0]).length }, { children: _jsx(Text, Object.assign({ weight: 500, align: "center" }, { children: "Nothing found" })) })) })) })] }))] }));
}
