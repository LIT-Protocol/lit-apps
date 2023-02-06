import { LitButton } from "./LitButton";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { getShortAddress } from "@lit-dev/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const LitConnect = () => {
  const { address, isConnected } = useAccount();

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const [_isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // if (isConnected) {
    setIsConnected(isConnected);
    // }

    // handle if click outside of menu, set 'lit-mini-menu' to 'none'
    const handleClickOutside = (e: any) => {
      const menu = e.target.parentElement.querySelector(".lit-mini-menu");
      if (!menu) return;

      if (e.target.className === "lit-button-2") {
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

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    toast(`🔥 Copied ${getShortAddress(address)}`, {
      duration: 2000,
    });
  };

  const renderConnected = () => {
    return (
      <div className="flex flex-col relative">
        <LitButton className="lit-button-2">
          {getShortAddress(address)}
        </LitButton>
        <div className="lit-mini-menu flex space-between">
          <div className="flex center-item h-30">
            <span>{getShortAddress(address)}</span>
          </div>
          <div className="lit-mini-menu-icons flex gap-6">
            <LitButton icon="copy" hoverText="Copy" onClick={handleCopy} />
            {/* <LitButton icon="open-new" hoverText="Explore" /> */}
            <LitButton
              icon="shutdown"
              hoverText="Logout"
              onClick={() => disconnect()}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderDisconnected = () => {
    return (
      <LitButton onClick={() => connect()} className="lit-button-2">
        Connect
      </LitButton>
    );
  };

  return !_isConnected ? renderDisconnected() : renderConnected();
};
