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
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import "./styles.css";
// <AlertDialog.Trigger asChild>
//   {/* <button className="Button violet">Delete account</button> */}
//   {prop.children}
// </AlertDialog.Trigger>
var LitAlertDialog = function (prop) { return (_jsx(AlertDialog.Root, __assign({}, prop, { children: _jsxs(AlertDialog.Portal, { children: [_jsx(AlertDialog.Overlay, { className: "AlertDialogOverlay" }), _jsxs(AlertDialog.Content, __assign({ className: "AlertDialogContent" }, { children: [_jsx(AlertDialog.Title, __assign({ className: "AlertDialogTitle" }, { children: "Are you absolutely sure?" })), _jsx(AlertDialog.Description, __assign({ className: "AlertDialogDescription" }, { children: prop.description })), _jsxs("div", __assign({ style: { display: "flex", gap: 25, justifyContent: "flex-end" } }, { children: [_jsx(AlertDialog.Cancel, __assign({ asChild: true }, { children: _jsx("button", __assign({ onClick: function () { return prop === null || prop === void 0 ? void 0 : prop.onCancel(); }, className: "Button mauve" }, { children: "Cancel" })) })), _jsx(AlertDialog.Action, __assign({ asChild: true }, { children: _jsx("button", __assign({ onClick: function () { return prop === null || prop === void 0 ? void 0 : prop.onConfirm(); }, className: "Button red" }, { children: "Yes, delete account" })) }))] }))] }))] }) }))); };
export default LitAlertDialog;
