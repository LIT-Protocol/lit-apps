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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useReducer, useState } from "react";
import { LitButton } from "../LitButton";
import { LitIcon } from "../LitIcon";
import { StateReducer } from "../StateReducer";
import { JsonRpcProvider } from "@ethersproject/providers";
import { LitInputTextV1 } from "../form/LitInputTextV1";
export var ELEventSelectorOptions = function (prop) {
    var _a = useReducer(StateReducer, {
        data: [],
        loading: false,
    }), state = _a[0], dispatch = _a[1];
    var _b = useState(), jsonRpcProvider = _b[0], setJsonRpcProvider = _b[1];
    var _c = useState(0), currentBlockNumber = _c[0], setCurrentBlockNumber = _c[1];
    useEffect(function () {
        if (!jsonRpcProvider && !currentBlockNumber) {
            var provider = new JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
            setJsonRpcProvider(provider);
            provider.on("block", function (blockNumber) { return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (blockNumber > currentBlockNumber) {
                        setCurrentBlockNumber(blockNumber);
                    }
                    return [2 /*return*/];
                });
            }); });
        }
    });
    var handleNewState = function (newState) {
        dispatch({
            type: "SET_DATA",
            payload: newState,
        });
        if (prop.onChange) {
            console.log("state:", state.data);
            prop.onChange(__assign(__assign({}, state.data), newState));
        }
    };
    return (_jsxs("div", __assign({ className: "flex flex-col gap-8 relative" }, { children: [_jsxs("div", __assign({ className: "lit-block-number" }, { children: [_jsx("span", { children: _jsx(LitIcon, { icon: "greendot" }) }), _jsx("span", { children: currentBlockNumber })] })), _jsx(LitInputTextV1, { label: "Start Block", onChange: function (e) {
                    return handleNewState({
                        startBlock: e.target.value,
                    });
                } }), _jsxs("div", __assign({ className: "lit-input-v1 text-xs txt-grey text-right flex gap-6" }, { children: [_jsx(LitButton, __assign({ className: "lit-mini-button active" }, { children: "Repeat until" })), _jsx(LitButton, __assign({ className: "lit-mini-button disabled" }, { children: "Repeat every x blocks" }))] })), _jsx(LitInputTextV1, { label: "End Block", onChange: function (e) {
                    return handleNewState({
                        endBlock: e.target.value,
                    });
                } })] })));
};
