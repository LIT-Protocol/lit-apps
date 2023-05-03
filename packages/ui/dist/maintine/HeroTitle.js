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
import { createStyles, Container, Text, rem, } from "@mantine/core";
var useStyles = createStyles(function (theme) {
    var _a, _b, _c, _d, _e;
    return ({
        wrapper: {
            position: "relative",
            boxSizing: "border-box",
            // backgroundColor:
            //   theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
            // backgroundColor: theme.colors.dark[8],
        },
        inner: (_a = {
                position: "relative",
                paddingTop: rem(0),
                textAlign: "center"
            },
            // paddingBottom: rem(120),
            _a[theme.fn.smallerThan("sm")] = {
                paddingBottom: rem(80),
                paddingTop: rem(64),
            },
            _a),
        title: (_b = {
                fontFamily: "Figtree, Space Grotesk, Greycliff CF, ".concat(theme.fontFamily),
                fontSize: rem(48),
                fontWeight: 900,
                lineHeight: 1.1,
                margin: 0,
                padding: 0
            },
            // color: theme.colorScheme === "dark" ? theme.white : theme.black,
            // color: theme.black,
            _b[theme.fn.smallerThan("sm")] = {
                fontSize: rem(42),
                lineHeight: 1.2,
            },
            _b),
        description: (_c = {
                marginTop: theme.spacing.xl,
                fontSize: rem(20)
            },
            _c[theme.fn.smallerThan("sm")] = {
                fontSize: rem(18),
            },
            _c),
        controls: (_d = {
                marginTop: "calc(".concat(theme.spacing.xl, " * 2)")
            },
            _d[theme.fn.smallerThan("sm")] = {
                marginTop: theme.spacing.xl,
            },
            _d),
        control: (_e = {
                height: rem(54),
                paddingLeft: rem(38),
                paddingRight: rem(38)
            },
            _e[theme.fn.smallerThan("sm")] = {
                height: rem(54),
                paddingLeft: rem(18),
                paddingRight: rem(18),
                flex: 1,
            },
            _e),
    });
});
export function HeroTitle(_a) {
    var titleLeft = _a.titleLeft, titleFocus = _a.titleFocus, titleRight = _a.titleRight, text = _a.text;
    var classes = useStyles().classes;
    return (_jsx("div", __assign({ className: classes.wrapper }, { children: _jsxs(Container, __assign({ size: 700, className: classes.inner }, { children: [_jsxs("h1", __assign({ className: classes.title }, { children: [titleLeft, " ", _jsx(Text, __assign({ component: "span", variant: "gradient", gradient: { from: "#FF9F6D", to: "#EF5D34" }, inherit: true }, { children: titleFocus })), " ", titleRight] })), _jsx(Text, __assign({ className: classes.description, color: "dimmed" }, { children: text }))] })) })));
}
