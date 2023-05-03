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
// @ts-nocheck
import * as React from 'react';
import * as Toast from '@radix-ui/react-toast';
export var LitToast = function (_a) {
    var data = _a.data, onSwipe = _a.onSwipe;
    var eventDateRef = React.useRef(new Date());
    var timerRef = React.useRef(0);
    React.useEffect(function () {
        return function () { return clearTimeout(timerRef.current); };
    }, []);
    return (_jsxs(Toast.Provider, __assign({ swipeDirection: "right" }, { children: [JSON.stringify(data), _jsxs(Toast.Root, __assign({ className: "ToastRoot", open: data.open, onOpenChange: onSwipe }, { children: [_jsx(Toast.Title, __assign({ className: "ToastTitle" }, { children: data.message })), _jsx(Toast.Description, __assign({ asChild: true }, { children: _jsx("time", __assign({ className: "ToastDescription", dateTime: eventDateRef.current.toISOString() }, { children: prettyDate(eventDateRef.current) })) })), _jsx(Toast.Action, __assign({ className: "ToastAction", asChild: true, altText: "Goto schedule to undo" }, { children: _jsx("button", __assign({ className: "Button small green" }, { children: "Undo" })) }))] })), _jsx(Toast.Viewport, { className: "ToastViewport" })] })));
};
function oneWeekAway(date) {
    var now = new Date();
    var inOneWeek = now.setDate(now.getDate() + 7);
    return new Date(inOneWeek);
}
function prettyDate(date) {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeStyle: 'short' }).format(date);
}
