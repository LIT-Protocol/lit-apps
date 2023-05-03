import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { LitButton } from "./LitButton";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { getShortAddress } from "@lit-dev/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePKPConnectionContext } from "./useContext/usePKPConnectionContext";
import { LitIcon } from "./LitIcon";
export const LitConnect = () => {
    const { pkpConnected, selectedPKP } = usePKPConnectionContext();
    const { address, isConnected } = useAccount();
    const { connect } = useConnect({
        connector: new InjectedConnector(),
    });
    const { disconnect } = useDisconnect();
    const [_isConnected, setIsConnected] = useState(false);
    const [selectedAddr, setSelectedAddr] = useState("eth");
    useEffect(() => {
        setIsConnected(isConnected);
        // handle if click outside of menu, set 'lit-mini-menu' to 'none'
        const handleClickOutside = (e) => {
            const menu = document.querySelector(".lit-mini-menu");
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
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isConnected]);
    const handleCopy = (addr) => {
        if (addr) {
            navigator.clipboard.writeText(addr);
            toast.success(`Copied ${getShortAddress(addr)}`, {
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
    const renderConnected = () => {
        return (_jsxs("div", Object.assign({ className: "flex flex-col relative" }, { children: [_jsxs(LitButton, Object.assign({ id: "lit-connect-menu", className: "lit-button-2lines flex flex-col" }, { children: [_jsx("div", Object.assign({ className: "no-pointer" }, { children: getShortAddress(address) })), _jsx("div", Object.assign({ className: "no-pointer" }, { children: pkpConnected ? (_jsxs("div", Object.assign({ className: "flex gap-6" }, { children: [_jsx("div", Object.assign({ className: "flex center-item" }, { children: _jsx(LitIcon, { className: "flex center-item", icon: "greendot" }) })), _jsxs("div", { children: ["PKP:ID:", getShortAddress(selectedPKP.tokenId)] })] }))) : (_jsx("div", Object.assign({ className: "error text-sm" }, { children: "Connect to cloud wallet" }))) }))] })), _jsxs("div", Object.assign({ className: "lit-mini-menu flex-col" }, { children: [_jsxs("div", Object.assign({ className: "flex space-between" }, { children: [_jsx("div", Object.assign({ className: "flex center-item h-30" }, { children: _jsx("span", { children: getShortAddress(address) }) })), _jsxs("div", Object.assign({ className: "lit-mini-menu-icons flex gap-6" }, { children: [_jsx(LitButton, { icon: "copy", hovertext: "Copy", onClick: () => handleCopy(address !== null && address !== void 0 ? address : "") }), _jsx(LitButton, { icon: "open-new", hovertext: "Explore", onClick: () => {
                                                // go to polygonscan explorer by address
                                                window.open(`https://polygonscan.com/address/${address}`, "_blank");
                                            } }), _jsx(LitButton, { className: "bg-error", icon: "shutdown", hovertext: "Logout", onClick: () => {
                                                disconnect();
                                            } })] }))] })), Object.keys(selectedPKP).length <= 0 ? ("") : (_jsxs("div", Object.assign({ className: "flex space-between pt-21" }, { children: [_jsx("div", Object.assign({ className: "flex center-item h-30" }, { children: _jsxs("div", Object.assign({ className: "flex flex-col" }, { children: [_jsxs("div", Object.assign({ className: "flex gap-6" }, { children: [_jsx("div", Object.assign({ className: "flex center-item" }, { children: _jsx(LitIcon, { className: "flex center-item", icon: `${selectedAddr === "eth" ? "greendot" : "greydot"}` }) })), _jsxs("div", Object.assign({ onClick: () => setSelectedAddr("eth"), className: `click-allowed text-sm ${selectedAddr === "eth" ? "" : "txt-grey"}` }, { children: ["PKP:ETH:", getShortAddress(selectedPKP.ethAddress)] }))] })), _jsxs("div", Object.assign({ className: "flex gap-6" }, { children: [_jsx("div", Object.assign({ className: "flex center-item" }, { children: _jsx(LitIcon, { className: "flex center-item", icon: `${selectedAddr === "pub" ? "greendot" : "greydot"}` }) })), _jsxs("div", Object.assign({ onClick: () => setSelectedAddr("pub"), className: `click-allowed text-sm ${selectedAddr === "pub" ? "" : "txt-grey"}` }, { children: ["PKP:PUB:", getShortAddress(selectedPKP.publicKey)] }))] }))] })) })), _jsxs("div", Object.assign({ className: "lit-mini-menu-icons flex gap-6" }, { children: [_jsx(LitButton, { icon: "copy", hovertext: "Copy", onClick: () => handleCopy(selectedAddr === "eth"
                                                ? selectedPKP.ethAddress
                                                : selectedPKP.publicKey) }), _jsx(LitButton, { icon: "open-new", hovertext: "Explore", onClick: () => {
                                                // go to polygonscan explorer by address
                                                if (selectedAddr === "eth") {
                                                    window.open(`https://polygonscan.com/address/${selectedPKP.ethAddress}`, "_blank");
                                                }
                                                if (selectedAddr === "btc") {
                                                    //  go to btc explorer by address
                                                    window.open(`https://www.blockchain.com/btc/address/${selectedPKP.btcAddress}`, "_blank");
                                                }
                                            } })] }))] }))), _jsxs("div", Object.assign({ className: "separator-t flex flex-col" }, { children: [_jsx(LitButton, Object.assign({ className: "lit-button-3", redirect: "/" }, { children: "Dashboard" })), _jsx(LitButton, Object.assign({ className: "lit-button-3 flex flex-col align-left", redirect: "/login" }, { children: _jsxs("div", Object.assign({ className: "lit-button-3-double-lines" }, { children: [_jsx("span", Object.assign({ className: "" }, { children: Object.keys(selectedPKP).length <= 0 ? (_jsxs(_Fragment, { children: ["No PKP Connected, Click to Connect", _jsx("br", {})] })) : (_jsxs(_Fragment, { children: ["Connected:", getShortAddress(selectedPKP.tokenId), " ", _jsx("br", {})] })) })), _jsx("span", Object.assign({ className: "txt-grey" }, { children: "View Cloud Wallets" }))] })) }))] }))] }))] })));
    };
    const renderDisconnected = () => {
        return (_jsx(LitButton, Object.assign({ onClick: () => connect(), className: "lit-button-2" }, { children: "Connect" })));
    };
    return !_isConnected ? renderDisconnected() : renderConnected();
};
