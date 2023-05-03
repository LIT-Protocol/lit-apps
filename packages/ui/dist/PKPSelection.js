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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ECDSAAddresses, getShortAddress } from "@lit-dev/utils";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { useEffect, useReducer } from "react";
import { toast } from "react-hot-toast";
import { LitCopy } from "./LitCopy";
import { LitIcon } from "./LitIcon";
import { LitLoading } from "./LitLoading";
import { PKPCard } from "./PKPCard";
import { usePKPConnectionContext } from "./useContext/usePKPConnectionContext";
import { StateReducer } from "./StateReducer";
import { LitButton } from "./LitButton";
import { watchSigner } from "@wagmi/core";
var fetchPKPs = function (walletAddress, onProgress) { return __awaiter(void 0, void 0, void 0, function () {
    var litContracts, tokenIds, tokens, i, tokenInfo, progress, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                litContracts = new LitContracts({
                    debug: false,
                });
                return [4 /*yield*/, litContracts.connect()];
            case 1:
                _a.sent();
                return [4 /*yield*/, litContracts.pkpNftContractUtil.read.getTokensByAddress(walletAddress)];
            case 2:
                tokenIds = _a.sent();
                tokens = [];
                i = 0;
                _a.label = 3;
            case 3:
                if (!(i < tokenIds.length)) return [3 /*break*/, 8];
                tokenInfo = void 0;
                _a.label = 4;
            case 4:
                _a.trys.push([4, 6, , 7]);
                return [4 /*yield*/, ECDSAAddresses({
                        pkpTokenId: tokenIds[i],
                        options: {
                            cacheContractCall: true,
                        },
                    })];
            case 5:
                tokenInfo = _a.sent();
                tokens.push(tokenInfo);
                if (onProgress) {
                    progress = parseInt((((i + 1) / tokenIds.length) * 100).toFixed(2));
                    onProgress(tokens, tokenInfo, progress);
                }
                return [3 /*break*/, 7];
            case 6:
                e_1 = _a.sent();
                console.error(e_1);
                return [3 /*break*/, 7];
            case 7:
                i++;
                return [3 /*break*/, 3];
            case 8: return [2 /*return*/, tokens];
        }
    });
}); };
export var PKPSelection = function (_a) {
    var _b;
    var address = _a.address, onDone = _a.onDone;
    var _c = usePKPConnectionContext(), pkpConnected = _c.pkpConnected, selectedPKP = _c.selectedPKP, setSelected = _c.setSelected;
    var _d = useReducer(StateReducer, {
        data: [],
        loading: false,
    }), state = _d[0], dispatch = _d[1];
    watchSigner({
        chainId: 1,
    }, function (provider) { return __awaiter(void 0, void 0, void 0, function () {
        var addr, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dispatch({
                        type: "LOADING",
                        loadingMessage: "Fetching PKPs...",
                    });
                    return [4 /*yield*/, (provider === null || provider === void 0 ? void 0 : provider.getAddress())];
                case 1:
                    addr = (_a.sent());
                    return [4 /*yield*/, fetchPKPs(addr, function (tokens, tokenInfo, progress) {
                            dispatch({
                                type: "LOADING",
                                loadingMessage: "Loading ".concat(progress, "%.."),
                            });
                        })];
                case 2:
                    result = _a.sent();
                    dispatch({ type: "SET_DATA", payload: { pkps: result } });
                    return [2 /*return*/];
            }
        });
    }); });
    useEffect(function () {
        function loadData() {
            return __awaiter(this, void 0, void 0, function () {
                var result, selectedPKP, pkp, pkpCard;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            dispatch({
                                type: "LOADING",
                                loadingMessage: "Fetching PKPs...",
                            });
                            return [4 /*yield*/, fetchPKPs(address, function (tokens, tokenInfo, progress) {
                                    dispatch({
                                        type: "LOADING",
                                        loadingMessage: "Loading ".concat(progress, "%.."),
                                    });
                                })];
                        case 1:
                            result = _a.sent();
                            dispatch({ type: "SET_DATA", payload: { pkps: result } });
                            selectedPKP = localStorage.getItem("lit-selected-pkp");
                            if (selectedPKP) {
                                pkp = JSON.parse(selectedPKP);
                                dispatch({ type: "SET_DATA", payload: { selectedPKP: pkp } });
                                pkpCard = document.getElementById("pkp-card-".concat(pkp.tokenId));
                                if (pkpCard) {
                                    pkpCard.scrollIntoView({
                                        behavior: "smooth",
                                        block: "center",
                                        inline: "center",
                                    });
                                }
                            }
                            // callback done
                            if (onDone) {
                                onDone();
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
        loadData();
    }, []);
    var onSelectToken = function (e, pkp) {
        var _a;
        if (!((_a = __spreadArray([], e.target.classList, true)) === null || _a === void 0 ? void 0 : _a.includes("pkp-card-focus")))
            return;
        // save the selected pkp to localstorage
        try {
            localStorage.setItem("lit-selected-pkp", JSON.stringify(pkp));
            dispatch({ type: "SET_DATA", payload: { selectedPKP: pkp } });
            // update PKPConnectedProvider
            setSelected(pkp);
        }
        catch (e) {
            toast.error("Error saving selected PKP to localstorage", {
                duration: 1000,
            });
        }
    };
    var onMint = function () { return __awaiter(void 0, void 0, void 0, function () {
        var litContracts, tx, result, e_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    dispatch({
                        type: "LOADING",
                        loadingMessage: "Minting PKP...",
                    });
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 5, , 6]);
                    litContracts = new LitContracts({
                        debug: false,
                    });
                    return [4 /*yield*/, litContracts.connect()];
                case 2:
                    _c.sent();
                    return [4 /*yield*/, litContracts.pkpNftContractUtil.write.mint()];
                case 3:
                    tx = _c.sent();
                    console.log("Tx: ", tx);
                    toast.success("Successfully minted PKP!", {
                        duration: 1000,
                    });
                    return [4 /*yield*/, fetchPKPs(address, function (tokens, tokenInfo, progress) {
                            dispatch({
                                type: "LOADING",
                                loadingMessage: "Loading ".concat(progress, "%.."),
                            });
                        })];
                case 4:
                    result = _c.sent();
                    console.log("result:", result);
                    dispatch({ type: "SET_DATA", payload: { pkps: result } });
                    return [3 /*break*/, 6];
                case 5:
                    e_2 = _c.sent();
                    toast.error((_b = (_a = e_2 === null || e_2 === void 0 ? void 0 : e_2.data) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : "Error minting", {
                        duration: 1000,
                    });
                    return [3 /*break*/, 6];
                case 6:
                    dispatch({ type: "SET_DATA" });
                    return [2 /*return*/];
            }
        });
    }); };
    if (((_b = state.data.pkps) === null || _b === void 0 ? void 0 : _b.length) <= 0) {
        return (_jsxs("div", __assign({ className: "flex flex-col gap-12" }, { children: [_jsx("h2", { children: "Oops... it seems that you don't have any cloud wallets!" }), _jsx("div", __assign({ className: "m-auto" }, { children: state.loading ? (_jsx(LitLoading, { icon: "lit-logo", text: state.loadingMessage })) : (_jsx(LitButton, __assign({ onClick: onMint }, { children: "Mint PKP" }))) }))] })));
    }
    if (state.loading || !state.data.pkps) {
        return _jsx(LitLoading, { icon: "lit-logo", text: state.loadingMessage });
    }
    return (_jsxs("div", __assign({ className: "heading" }, { children: [_jsxs("div", __assign({ className: "flex gap-12" }, { children: [_jsx("h3", { children: "My Cloud Wallets" }), _jsx(LitButton, __assign({ className: "lit-button-5", onClick: onMint }, { children: "Mint PKP" }))] })), _jsx("div", __assign({ className: "pkp-cards" }, { children: state.data.pkps.map(function (pkp, i) {
                    var _a;
                    // skip if pkp is undefined
                    if (!pkp)
                        return null;
                    var selected = ((_a = state.data.selectedPKP) === null || _a === void 0 ? void 0 : _a.tokenId) == (pkp === null || pkp === void 0 ? void 0 : pkp.tokenId);
                    return (_jsxs(PKPCard, __assign({ id: "pkp-card-".concat(pkp.tokenId), onClick: function (e) { return onSelectToken(e, pkp); }, className: "".concat(selected ? "pkp-card active" : "pkp-card") }, { children: [_jsxs("div", __assign({ className: "flex pkp-card-focus" }, { children: [_jsx("div", __assign({ className: "pkp-card-icon" }, { children: _jsx(LitIcon, { icon: "wallet" }) })), _jsxs("div", __assign({ className: "flex flex-col" }, { children: [_jsx("div", __assign({ className: "pkp-card-title flex space-between" }, { children: _jsx(LitCopy, { copyText: pkp.tokenId, text: "#".concat(i + 1, " | Token ID: ").concat(getShortAddress(pkp.tokenId, 8, 4)) }) })), _jsx("div", __assign({ className: "pkp-card-addr flex space-between" }, { children: _jsx(LitCopy, { copyText: pkp.publicKey, text: "Public Key: ".concat(getShortAddress(pkp.publicKey, 8, 4)) }) })), _jsx("div", __assign({ className: "pkp-card-addr flex space-between" }, { children: _jsx(LitCopy, { copyText: pkp.ethAddress, text: "ETH Address: ".concat(getShortAddress(pkp.ethAddress, 8, 4)) }) })), _jsx("div", __assign({ className: "pkp-card-addr flex space-between" }, { children: _jsx(LitCopy, { copyText: pkp.btcAddress, text: "BTC Address: ".concat(getShortAddress(pkp.btcAddress, 8, 4)) }) })), _jsx("div", __assign({ className: "pkp-card-addr flex space-between" }, { children: _jsx(LitCopy, { copyText: pkp.cosmosAddress, text: "Cosmos Address: ".concat(getShortAddress(pkp.cosmosAddress, 8, 4)) }) }))] })), _jsx("div", __assign({ className: "pkp-card-tick" }, { children: !selected ? "Select" : _jsx(LitIcon, { icon: "tick" }) }))] })), _jsx("div", {})] }), i));
                }) }))] })));
};
