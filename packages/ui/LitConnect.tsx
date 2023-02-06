import { LitButton } from "./LitButton";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { getShortAddress, TokenInfo } from "@lit-dev/utils";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePKPConnectionContext } from "./PKPConnectionContext";
import { LitIcon } from "./LitIcon";

export const LitConnect = () => {
  const { pkpConnected, selectedPKP } = usePKPConnectionContext();

  const { address, isConnected } = useAccount();

  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  const [_isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(isConnected);

    // handle if click outside of menu, set 'lit-mini-menu' to 'none'
    const handleClickOutside = (e: any) => {
      const menu: any = document.querySelector(".lit-mini-menu");

      if (!menu) return;

      if (
        e.target.id === "lit-connect-menu" ||
        e.target.classList.contains("lit-button-icon")
      ) {
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
        <LitButton
          id="lit-connect-menu"
          className="lit-button-2lines flex flex-col"
        >
          <div className="no-pointer">{getShortAddress(address)}</div>
          <div className="no-pointer">
            {pkpConnected ? (
              <div className="flex gap-6">
                <div className="flex center-item">
                  {/* svg green dot */}
                  <LitIcon className="flex center-item" icon="greendot" />
                </div>
                <div>
                  PKP:ID:
                  {getShortAddress((selectedPKP as TokenInfo).tokenId)}
                </div>
              </div>
            ) : (
              <div className="error">Connect to cloud wallet</div>
            )}
          </div>
        </LitButton>
        <div className="lit-mini-menu flex-col">
          <div className="flex space-between">
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

          <div className="separator-t flex flex-col">
            <LitButton className="lit-button-3" redirect="/">
              Dashboard
            </LitButton>
            <LitButton
              className="lit-button-3 flex flex-col align-left"
              redirect="/login"
            >
              <div className="lit-button-3-double-lines">
                <span className="">
                  Connected:
                  {getShortAddress((selectedPKP as TokenInfo).tokenId)} <br />
                </span>
                <span className="txt-grey">View Cloud Wallets</span>
              </div>
            </LitButton>
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
