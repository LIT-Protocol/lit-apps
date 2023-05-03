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
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { LitButton } from "./LitButton";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { getShortAddress } from "@lit-dev/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePKPConnectionContext } from "./useContext/usePKPConnectionContext";
import { LitIcon } from "./LitIcon";
export var LitConnect = function () {
    var _a = usePKPConnectionContext(), pkpConnected = _a.pkpConnected, selectedPKP = _a.selectedPKP;
    var _b = useAccount(), address = _b.address, isConnected = _b.isConnected;
    var connect = useConnect({
        connector: new InjectedConnector(),
    }).connect;
    var disconnect = useDisconnect().disconnect;
    var _c = useState(false), _isConnected = _c[0], setIsConnected = _c[1];
    var _d = useState("eth"), selectedAddr = _d[0], setSelectedAddr = _d[1];
    useEffect(function () {
        setIsConnected(isConnected);
        // handle if click outside of menu, set 'lit-mini-menu' to 'none'
        var handleClickOutside = function (e) {
            var menu = document.querySelector(".lit-mini-menu");
            if (!menu)
                return;
            // allow list of elements to be clicked
            if (e.target.id === "lit-connect-menu" ||
                e.target.classList.contains("lit-button-icon") ||
                e.target.classList.contains("click-allowed")) {
                menu.style.display = "flex";
                return;
            }
            menu.style.display = "none";
        };
        document.addEventListener("click", handleClickOutside);
        return function () {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isConnected]);
    var handleCopy = function (addr) {
        if (addr) {
            navigator.clipboard.writeText(addr);
            toast.success("Copied ".concat(getShortAddress(addr)), {
                duration: 2000,
            });
            return;
        }
        // if (!address) return;
        // navigator.clipboard.writeText(address);
        // toast.success(`Copied ${getShortAddress(address)}`, {
        //   duration: 2000,
        // });
    };
    var renderConnected = function () {
        return (_jsxs("div", __assign({ className: "flex flex-col relative" }, { children: [_jsxs(LitButton, __assign({ id: "lit-connect-menu", className: "lit-button-2lines flex flex-col" }, { children: [_jsx("div", __assign({ className: "no-pointer" }, { children: getShortAddress(address) })), _jsx("div", __assign({ className: "no-pointer" }, { children: pkpConnected ? (_jsxs("div", __assign({ className: "flex gap-6" }, { children: [_jsx("div", __assign({ className: "flex center-item" }, { children: _jsx(LitIcon, { className: "flex center-item", icon: "greendot" }) })), _jsxs("div", { children: ["PKP:ID:", getShortAddress(selectedPKP.tokenId)] })] }))) : (_jsx("div", __assign({ className: "error text-sm" }, { children: "Connect to cloud wallet" }))) }))] })), _jsxs("div", __assign({ className: "lit-mini-menu flex-col" }, { children: [_jsxs("div", __assign({ className: "flex space-between" }, { children: [_jsx("div", __assign({ className: "flex center-item h-30" }, { children: _jsx("span", { children: getShortAddress(address) }) })), _jsxs("div", __assign({ className: "lit-mini-menu-icons flex gap-6" }, { children: [_jsx(LitButton, { icon: "copy", hovertext: "Copy", onClick: function () { return handleCopy(address !== null && address !== void 0 ? address : ""); } }), _jsx(LitButton, { icon: "open-new", hovertext: "Explore", onClick: function () {
                                                // go to polygonscan explorer by address
                                                window.open("https://polygonscan.com/address/".concat(address), "_blank");
                                            } }), _jsx(LitButton, { className: "bg-error", icon: "shutdown", hovertext: "Logout", onClick: function () {
                                                disconnect();
                                            } })] }))] })), Object.keys(selectedPKP).length <= 0 ? ("") : (_jsxs("div", __assign({ className: "flex space-between pt-21" }, { children: [_jsx("div", __assign({ className: "flex center-item h-30" }, { children: _jsxs("div", __assign({ className: "flex flex-col" }, { children: [_jsxs("div", __assign({ className: "flex gap-6" }, { children: [_jsx("div", __assign({ className: "flex center-item" }, { children: _jsx(LitIcon, { className: "flex center-item", icon: "".concat(selectedAddr === "eth" ? "greendot" : "greydot") }) })), _jsxs("div", __assign({ onClick: function () { return setSelectedAddr("eth"); }, className: "click-allowed text-sm ".concat(selectedAddr === "eth" ? "" : "txt-grey") }, { children: ["PKP:ETH:", getShortAddress(selectedPKP.ethAddress)] }))] })), _jsxs("div", __assign({ className: "flex gap-6" }, { children: [_jsx("div", __assign({ className: "flex center-item" }, { children: _jsx(LitIcon, { className: "flex center-item", icon: "".concat(selectedAddr === "pub" ? "greendot" : "greydot") }) })), _jsxs("div", __assign({ onClick: function () { return setSelectedAddr("pub"); }, className: "click-allowed text-sm ".concat(selectedAddr === "pub" ? "" : "txt-grey") }, { children: ["PKP:PUB:", getShortAddress(selectedPKP.publicKey)] }))] }))] })) })), _jsxs("div", __assign({ className: "lit-mini-menu-icons flex gap-6" }, { children: [_jsx(LitButton, { icon: "copy", hovertext: "Copy", onClick: function () {
                                                return handleCopy(selectedAddr === "eth"
                                                    ? selectedPKP.ethAddress
                                                    : selectedPKP.publicKey);
                                            } }), _jsx(LitButton, { icon: "open-new", hovertext: "Explore", onClick: function () {
                                                // go to polygonscan explorer by address
                                                if (selectedAddr === "eth") {
                                                    window.open("https://polygonscan.com/address/".concat(selectedPKP.ethAddress), "_blank");
                                                }
                                                if (selectedAddr === "btc") {
                                                    //  go to btc explorer by address
                                                    window.open("https://www.blockchain.com/btc/address/".concat(selectedPKP.btcAddress), "_blank");
                                                }
                                            } })] }))] }))), _jsxs("div", __assign({ className: "separator-t flex flex-col" }, { children: [_jsx(LitButton, __assign({ className: "lit-button-3", redirect: "/" }, { children: "Dashboard" })), _jsx(LitButton, __assign({ className: "lit-button-3 flex flex-col align-left", redirect: "/login" }, { children: _jsxs("div", __assign({ className: "lit-button-3-double-lines" }, { children: [_jsx("span", __assign({ className: "" }, { children: Object.keys(selectedPKP).length <= 0 ? (_jsxs(_Fragment, { children: ["No PKP Connected, Click to Connect", _jsx("br", {})] })) : (_jsxs(_Fragment, { children: ["Connected:", getShortAddress(selectedPKP.tokenId), " ", _jsx("br", {})] })) })), _jsx("span", __assign({ className: "txt-grey" }, { children: "View Cloud Wallets" }))] })) }))] }))] }))] })));
    };
    var renderDisconnected = function () {
        return (_jsx(LitButton, __assign({ onClick: function () { return connect(); }, className: "lit-button-2" }, { children: "Connect" })));
    };
    return !_isConnected ? renderDisconnected() : renderConnected();
};
