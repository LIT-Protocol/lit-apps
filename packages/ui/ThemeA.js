import { jsx as _jsx } from "react/jsx-runtime";
// export with children
export const ThemeA = (props) => {
    return _jsx("div", Object.assign({}, props, { children: props.children }));
};
