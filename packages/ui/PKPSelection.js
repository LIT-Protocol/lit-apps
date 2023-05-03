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
const fetchPKPs = (walletAddress, onProgress) => __awaiter(void 0, void 0, void 0, function* () {
    const litContracts = new LitContracts({
        debug: false,
    });
    yield litContracts.connect();
    const tokenIds = yield litContracts.pkpNftContractUtil.read.getTokensByAddress(walletAddress);
    const tokens = [];
    // async for each
    for (let i = 0; i < tokenIds.length; i++) {
        let tokenInfo;
        try {
            tokenInfo = yield ECDSAAddresses({
                pkpTokenId: tokenIds[i],
                options: {
                    cacheContractCall: true,
                },
            });
            tokens.push(tokenInfo);
            if (onProgress) {
                const progress = parseInt((((i + 1) / tokenIds.length) * 100).toFixed(2));
                onProgress(tokens, tokenInfo, progress);
            }
        }
        catch (e) {
            console.error(e);
            continue;
        }
    }
    return tokens;
});
export const PKPSelection = ({ address, onDone, }) => {
    var _a;
    const { pkpConnected, selectedPKP, setSelected } = usePKPConnectionContext();
    const [state, dispatch] = useReducer(StateReducer, {
        data: [],
        loading: false,
    });
    watchSigner({
        chainId: 1,
    }, (provider) => __awaiter(void 0, void 0, void 0, function* () {
        dispatch({
            type: "LOADING",
            loadingMessage: "Fetching PKPs...",
        });
        const addr = (yield (provider === null || provider === void 0 ? void 0 : provider.getAddress()));
        const result = yield fetchPKPs(addr, (tokens, tokenInfo, progress) => {
            dispatch({
                type: "LOADING",
                loadingMessage: `Loading ${progress}%..`,
            });
        });
        dispatch({ type: "SET_DATA", payload: { pkps: result } });
    }));
    useEffect(() => {
        function loadData() {
            return __awaiter(this, void 0, void 0, function* () {
                dispatch({
                    type: "LOADING",
                    loadingMessage: "Fetching PKPs...",
                });
                const result = yield fetchPKPs(address, (tokens, tokenInfo, progress) => {
                    dispatch({
                        type: "LOADING",
                        loadingMessage: `Loading ${progress}%..`,
                    });
                });
                dispatch({ type: "SET_DATA", payload: { pkps: result } });
                // check if localstorage has a selected pkp
                const selectedPKP = localStorage.getItem("lit-selected-pkp");
                if (selectedPKP) {
                    const pkp = JSON.parse(selectedPKP);
                    dispatch({ type: "SET_DATA", payload: { selectedPKP: pkp } });
                    // scroll to the selected pkp
                    const pkpCard = document.getElementById(`pkp-card-${pkp.tokenId}`);
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
            });
        }
        loadData();
    }, []);
    const onSelectToken = (e, pkp) => {
        var _a;
        if (!((_a = [...e.target.classList]) === null || _a === void 0 ? void 0 : _a.includes("pkp-card-focus")))
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
    const onMint = () => __awaiter(void 0, void 0, void 0, function* () {
        var _b, _c;
        dispatch({
            type: "LOADING",
            loadingMessage: "Minting PKP...",
        });
        try {
            const litContracts = new LitContracts({
                debug: false,
            });
            yield litContracts.connect();
            const tx = yield litContracts.pkpNftContractUtil.write.mint();
            console.log("Tx: ", tx);
            toast.success("Successfully minted PKP!", {
                duration: 1000,
            });
            const result = yield fetchPKPs(address, (tokens, tokenInfo, progress) => {
                dispatch({
                    type: "LOADING",
                    loadingMessage: `Loading ${progress}%..`,
                });
            });
            console.log("result:", result);
            dispatch({ type: "SET_DATA", payload: { pkps: result } });
        }
        catch (e) {
            toast.error((_c = (_b = e === null || e === void 0 ? void 0 : e.data) === null || _b === void 0 ? void 0 : _b.message) !== null && _c !== void 0 ? _c : "Error minting", {
                duration: 1000,
            });
        }
        dispatch({ type: "SET_DATA" });
    });
    if (((_a = state.data.pkps) === null || _a === void 0 ? void 0 : _a.length) <= 0) {
        return (_jsxs("div", Object.assign({ className: "flex flex-col gap-12" }, { children: [_jsx("h2", { children: "Oops... it seems that you don't have any cloud wallets!" }), _jsx("div", Object.assign({ className: "m-auto" }, { children: state.loading ? (_jsx(LitLoading, { icon: "lit-logo", text: state.loadingMessage })) : (_jsx(LitButton, Object.assign({ onClick: onMint }, { children: "Mint PKP" }))) }))] })));
    }
    if (state.loading || !state.data.pkps) {
        return _jsx(LitLoading, { icon: "lit-logo", text: state.loadingMessage });
    }
    return (_jsxs("div", Object.assign({ className: "heading" }, { children: [_jsxs("div", Object.assign({ className: "flex gap-12" }, { children: [_jsx("h3", { children: "My Cloud Wallets" }), _jsx(LitButton, Object.assign({ className: "lit-button-5", onClick: onMint }, { children: "Mint PKP" }))] })), _jsx("div", Object.assign({ className: "pkp-cards" }, { children: state.data.pkps.map((pkp, i) => {
                    var _a;
                    // skip if pkp is undefined
                    if (!pkp)
                        return null;
                    const selected = ((_a = state.data.selectedPKP) === null || _a === void 0 ? void 0 : _a.tokenId) == (pkp === null || pkp === void 0 ? void 0 : pkp.tokenId);
                    return (_jsxs(PKPCard, Object.assign({ id: `pkp-card-${pkp.tokenId}`, onClick: (e) => onSelectToken(e, pkp), className: `${selected ? "pkp-card active" : "pkp-card"}` }, { children: [_jsxs("div", Object.assign({ className: "flex pkp-card-focus" }, { children: [_jsx("div", Object.assign({ className: "pkp-card-icon" }, { children: _jsx(LitIcon, { icon: "wallet" }) })), _jsxs("div", Object.assign({ className: "flex flex-col" }, { children: [_jsx("div", Object.assign({ className: "pkp-card-title flex space-between" }, { children: _jsx(LitCopy, { copyText: pkp.tokenId, text: `#${i + 1} | Token ID: ${getShortAddress(pkp.tokenId, 8, 4)}` }) })), _jsx("div", Object.assign({ className: "pkp-card-addr flex space-between" }, { children: _jsx(LitCopy, { copyText: pkp.publicKey, text: `Public Key: ${getShortAddress(pkp.publicKey, 8, 4)}` }) })), _jsx("div", Object.assign({ className: "pkp-card-addr flex space-between" }, { children: _jsx(LitCopy, { copyText: pkp.ethAddress, text: `ETH Address: ${getShortAddress(pkp.ethAddress, 8, 4)}` }) })), _jsx("div", Object.assign({ className: "pkp-card-addr flex space-between" }, { children: _jsx(LitCopy, { copyText: pkp.btcAddress, text: `BTC Address: ${getShortAddress(pkp.btcAddress, 8, 4)}` }) })), _jsx("div", Object.assign({ className: "pkp-card-addr flex space-between" }, { children: _jsx(LitCopy, { copyText: pkp.cosmosAddress, text: `Cosmos Address: ${getShortAddress(pkp.cosmosAddress, 8, 4)}` }) }))] })), _jsx("div", Object.assign({ className: "pkp-card-tick" }, { children: !selected ? "Select" : _jsx(LitIcon, { icon: "tick" }) }))] })), _jsx("div", {})] }), i));
                }) }))] })));
};
