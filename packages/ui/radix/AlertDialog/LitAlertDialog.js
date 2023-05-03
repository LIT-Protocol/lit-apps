import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import "./styles.css";
// <AlertDialog.Trigger asChild>
//   {/* <button className="Button violet">Delete account</button> */}
//   {prop.children}
// </AlertDialog.Trigger>
const LitAlertDialog = (prop) => (_jsx(AlertDialog.Root, Object.assign({}, prop, { children: _jsxs(AlertDialog.Portal, { children: [_jsx(AlertDialog.Overlay, { className: "AlertDialogOverlay" }), _jsxs(AlertDialog.Content, Object.assign({ className: "AlertDialogContent" }, { children: [_jsx(AlertDialog.Title, Object.assign({ className: "AlertDialogTitle" }, { children: "Are you absolutely sure?" })), _jsx(AlertDialog.Description, Object.assign({ className: "AlertDialogDescription" }, { children: prop.description })), _jsxs("div", Object.assign({ style: { display: "flex", gap: 25, justifyContent: "flex-end" } }, { children: [_jsx(AlertDialog.Cancel, Object.assign({ asChild: true }, { children: _jsx("button", Object.assign({ onClick: () => prop === null || prop === void 0 ? void 0 : prop.onCancel(), className: "Button mauve" }, { children: "Cancel" })) })), _jsx(AlertDialog.Action, Object.assign({ asChild: true }, { children: _jsx("button", Object.assign({ onClick: () => prop === null || prop === void 0 ? void 0 : prop.onConfirm(), className: "Button red" }, { children: "Yes, delete account" })) }))] }))] }))] }) })));
export default LitAlertDialog;
