import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
// Usage:
{ /* <LitSelectionV1
  items={events}
  button={{
    component: LitButton,
    className: "lit-mini-button capitalize",
  }}
  onClick={(item: { name: string }) => {
    setSelectedEvent(item.name);
  }}
/>; */
}
export const LitSelectionV1 = (prop) => {
    var _a;
    const defaultClass = "lit-selection-v1";
    // inject defaultClass into prop.className array
    const newProp = prop.className
        ? Object.assign(Object.assign({}, prop), { className: [...prop.className, ` ${defaultClass}`].join("") }) : Object.assign(Object.assign({}, prop), { className: defaultClass });
    // states
    const [selected, setSelected] = useState(null);
    //   handle click
    const handleClick = (item) => {
        setSelected(item);
        prop === null || prop === void 0 ? void 0 : prop.onClick(item);
    };
    return (_jsx(_Fragment, { children: (_a = prop === null || prop === void 0 ? void 0 : prop.items) === null || _a === void 0 ? void 0 : _a.map((item, index) => {
            return (_jsx(prop.button.component, Object.assign({ onClick: () => handleClick(item), className: `
              ${prop.button.className} ${(item === null || item === void 0 ? void 0 : item.enabled) ? "" : "disabled"}
              ${(selected === null || selected === void 0 ? void 0 : selected.name) === (item === null || item === void 0 ? void 0 : item.name) ? "active" : ""}
              ` }, { children: item === null || item === void 0 ? void 0 : item.name }), index));
        }) }));
};
