import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { toast } from "react-hot-toast";
import { LitIcon } from "./LitIcon";
export const LitCopy = (props) => {
    // copy to clipboard
    const copyToClipboard = (e) => {
        if (!props.copyText)
            return;
        navigator.clipboard.writeText(props.copyText);
        toast.success(`Copied ${props.text}`, { duration: 1000 });
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", Object.assign({ className: "" }, { children: props.text })), _jsx("div", Object.assign({ className: "lit-icon-wrapper flex gap-6" }, { children: _jsx(LitIcon, { onClick: copyToClipboard, icon: "copy" }) }))] }));
};
