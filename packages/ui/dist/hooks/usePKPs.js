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
import toast from "react-hot-toast";
import { useFetchData } from "./parents/useFetchData";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import React from "react";
/**
 * usePKPs is a custom hook that fetches Progrmmable Key Pairs (PKPs) data and returns
 * the data, loading, and error states along with a start function to initiate fetching.
 *
 * Example usage:
 * ```
 * const { data, loading, error, start } = usePKPs({ litNetwork: "serrano", chain: "ethereum" });
 *
 * // Call start() to initiate data fetching
 * start();
 * ```
 *
 * @param props Options object containing litNetwork and chain properties
 * @return { data, loading, error, start } The data, loading, error states, and a start function to initiate fetching
 */
export function usePKPs(props) {
    var _this = this;
    var defaultOptions = {
        litNetwork: "serrano",
        chain: "ethereum",
    };
    var fetchFunction = function () { return __awaiter(_this, void 0, void 0, function () {
        var litNodeClient, _authSig, e_1, litContracts, tokenInfos, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    litNodeClient = new LitNodeClient({
                        litNetwork: (props === null || props === void 0 ? void 0 : props.litNetwork) || defaultOptions.litNetwork,
                    });
                    return [4 /*yield*/, litNodeClient.connect()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, LitJsSdk.checkAndSignAuthMessage({
                            chain: (props === null || props === void 0 ? void 0 : props.chain) || defaultOptions.chain,
                        })];
                case 3:
                    _authSig = _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    e_1 = _a.sent();
                    toast.error("Authentication failed");
                    return [2 /*return*/];
                case 5:
                    litContracts = new LitContracts();
                    return [4 /*yield*/, litContracts.connect()];
                case 6:
                    _a.sent();
                    tokenInfos = [];
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 9, , 10]);
                    return [4 /*yield*/, litContracts.pkpNftContractUtil.read.getTokensInfoByAddress(_authSig.address)];
                case 8:
                    tokenInfos =
                        _a.sent();
                    return [3 /*break*/, 10];
                case 9:
                    e_2 = _a.sent();
                    toast.error("Failed to fetch PKPs");
                    return [2 /*return*/];
                case 10:
                    if (tokenInfos.length <= 0) {
                        toast.error("No PKPs found");
                        return [2 /*return*/];
                    }
                    return [2 /*return*/, tokenInfos];
            }
        });
    }); };
    var defaultRender = function (callback) {
        if (callback === void 0) { callback = function (pkp) { }; }
        if (loading)
            return _jsx("div", { children: "Loading..." });
        if (error)
            return _jsxs("div", { children: ["Error: ", error] });
        if (!data)
            return null;
        return (_jsx("div", __assign({ style: { width: "100%" } }, { children: _jsx("table", __assign({ style: { width: "100%", textAlign: "left", padding: "12px" } }, { children: _jsx("tbody", { children: data.map(function (pkp, index) { return (_jsx(React.Fragment, { children: _jsxs("div", __assign({ onClick: function () { return callback(pkp); } }, { children: [_jsxs("tr", { children: [_jsx("th", { children: "#" }), _jsx("td", { children: index + 1 })] }), _jsxs("tr", { children: [_jsx("th", { children: "Token ID" }), _jsx("td", { children: pkp.tokenId })] }), _jsxs("tr", { children: [_jsx("th", { children: "Public Key" }), _jsx("td", { children: pkp.publicKey })] }), _jsxs("tr", { children: [_jsx("th", { children: "BTC Address" }), _jsx("td", { children: pkp.btcAddress })] }), _jsxs("tr", { children: [_jsx("th", { children: "ETH Address" }), _jsx("td", { children: pkp.ethAddress })] }), _jsxs("tr", { children: [_jsx("th", { children: "Cosmos Address" }), _jsx("td", { children: pkp.cosmosAddress })] })] })) }, index)); }) }) })) })));
    };
    var _a = useFetchData(fetchFunction), data = _a.data, loading = _a.loading, error = _a.error, start = _a.start;
    return [data, loading, error, start, defaultRender];
}
