var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useReducer, useState } from "react";
import { LitButton } from "../LitButton";
import { LitIcon } from "../LitIcon";
import { StateReducer } from "../StateReducer";
import { JsonRpcProvider } from "@ethersproject/providers";
import { LitInputTextV1 } from "../form/LitInputTextV1";
export const ELEventSelectorOptions = (prop) => {
    const [state, dispatch] = useReducer(StateReducer, {
        data: [],
        loading: false,
    });
    const [jsonRpcProvider, setJsonRpcProvider] = useState();
    const [currentBlockNumber, setCurrentBlockNumber] = useState(0);
    useEffect(() => {
        if (!jsonRpcProvider && !currentBlockNumber) {
            const provider = new JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
            setJsonRpcProvider(provider);
            provider.on("block", (blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
                if (blockNumber > currentBlockNumber) {
                    setCurrentBlockNumber(blockNumber);
                }
            }));
        }
    });
    const handleNewState = (newState) => {
        dispatch({
            type: "SET_DATA",
            payload: newState,
        });
        if (prop.onChange) {
            console.log("state:", state.data);
            prop.onChange(Object.assign(Object.assign({}, state.data), newState));
        }
    };
    return (_jsxs("div", Object.assign({ className: "flex flex-col gap-8 relative" }, { children: [_jsxs("div", Object.assign({ className: "lit-block-number" }, { children: [_jsx("span", { children: _jsx(LitIcon, { icon: "greendot" }) }), _jsx("span", { children: currentBlockNumber })] })), _jsx(LitInputTextV1, { label: "Start Block", onChange: (e) => handleNewState({
                    startBlock: e.target.value,
                }) }), _jsxs("div", Object.assign({ className: "lit-input-v1 text-xs txt-grey text-right flex gap-6" }, { children: [_jsx(LitButton, Object.assign({ className: "lit-mini-button active" }, { children: "Repeat until" })), _jsx(LitButton, Object.assign({ className: "lit-mini-button disabled" }, { children: "Repeat every x blocks" }))] })), _jsx(LitInputTextV1, { label: "End Block", onChange: (e) => handleNewState({
                    endBlock: e.target.value,
                }) })] })));
};
