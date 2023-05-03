import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createStyles, Container, Text, rem, } from "@mantine/core";
const useStyles = createStyles((theme) => ({
    wrapper: {
        position: "relative",
        boxSizing: "border-box",
        // backgroundColor:
        //   theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
        // backgroundColor: theme.colors.dark[8],
    },
    inner: {
        position: "relative",
        paddingTop: rem(0),
        textAlign: "center",
        // paddingBottom: rem(120),
        [theme.fn.smallerThan("sm")]: {
            paddingBottom: rem(80),
            paddingTop: rem(64),
        },
    },
    title: {
        fontFamily: `Figtree, Space Grotesk, Greycliff CF, ${theme.fontFamily}`,
        fontSize: rem(48),
        fontWeight: 900,
        lineHeight: 1.1,
        margin: 0,
        padding: 0,
        // color: theme.colorScheme === "dark" ? theme.white : theme.black,
        // color: theme.black,
        [theme.fn.smallerThan("sm")]: {
            fontSize: rem(42),
            lineHeight: 1.2,
        },
    },
    description: {
        marginTop: theme.spacing.xl,
        fontSize: rem(20),
        [theme.fn.smallerThan("sm")]: {
            fontSize: rem(18),
        },
    },
    controls: {
        marginTop: `calc(${theme.spacing.xl} * 2)`,
        [theme.fn.smallerThan("sm")]: {
            marginTop: theme.spacing.xl,
        },
    },
    control: {
        height: rem(54),
        paddingLeft: rem(38),
        paddingRight: rem(38),
        [theme.fn.smallerThan("sm")]: {
            height: rem(54),
            paddingLeft: rem(18),
            paddingRight: rem(18),
            flex: 1,
        },
    },
}));
export function HeroTitle({ titleLeft, titleFocus, titleRight, text, }) {
    const { classes } = useStyles();
    return (_jsx("div", Object.assign({ className: classes.wrapper }, { children: _jsxs(Container, Object.assign({ size: 700, className: classes.inner }, { children: [_jsxs("h1", Object.assign({ className: classes.title }, { children: [titleLeft, " ", _jsx(Text, Object.assign({ component: "span", variant: "gradient", gradient: { from: "#FF9F6D", to: "#EF5D34" }, inherit: true }, { children: titleFocus })), " ", titleRight] })), _jsx(Text, Object.assign({ className: classes.description, color: "dimmed" }, { children: text }))] })) })));
}
