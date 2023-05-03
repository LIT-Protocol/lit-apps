import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import * as React from 'react';
import * as Toast from '@radix-ui/react-toast';
export const LitToast = ({ data, onSwipe }) => {
    const eventDateRef = React.useRef(new Date());
    const timerRef = React.useRef(0);
    React.useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);
    return (_jsxs(Toast.Provider, Object.assign({ swipeDirection: "right" }, { children: [JSON.stringify(data), _jsxs(Toast.Root, Object.assign({ className: "ToastRoot", open: data.open, onOpenChange: onSwipe }, { children: [_jsx(Toast.Title, Object.assign({ className: "ToastTitle" }, { children: data.message })), _jsx(Toast.Description, Object.assign({ asChild: true }, { children: _jsx("time", Object.assign({ className: "ToastDescription", dateTime: eventDateRef.current.toISOString() }, { children: prettyDate(eventDateRef.current) })) })), _jsx(Toast.Action, Object.assign({ className: "ToastAction", asChild: true, altText: "Goto schedule to undo" }, { children: _jsx("button", Object.assign({ className: "Button small green" }, { children: "Undo" })) }))] })), _jsx(Toast.Viewport, { className: "ToastViewport" })] })));
};
function oneWeekAway(date) {
    const now = new Date();
    const inOneWeek = now.setDate(now.getDate() + 7);
    return new Date(inOneWeek);
}
function prettyDate(date) {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(date);
}
