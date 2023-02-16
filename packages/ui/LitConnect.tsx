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

  const [selectedAddr, setSelectedAddr] = useState("eth");

  useEffect(() => {
    setIsConnected(isConnected);

    // handle if click outside of menu, set 'lit-mini-menu' to 'none'
    const handleClickOutside = (e: any) => {
      const menu: any = document.querySelector(".lit-mini-menu");

      if (!menu) return;

      // allow list of elements to be clicked
      if (
        e.target.id === "lit-connect-menu" ||
        e.target.classList.contains("lit-button-icon") ||
        e.target.classList.contains("click-allowed")
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

  const handleCopy = (addr: string) => {
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
              <div className="error text-sm">Connect to cloud wallet</div>
            )}
          </div>
        </LitButton>
        <div className="lit-mini-menu flex-col">
          <div className="flex space-between">
            <div className="flex center-item h-30">
              <span>{getShortAddress(address)}</span>
            </div>
            <div className="lit-mini-menu-icons flex gap-6">
              <LitButton
                icon="copy"
                hovertext="Copy"
                onClick={() => handleCopy(address ?? "")}
              />
              <LitButton
                icon="open-new"
                hovertext="Explore"
                onClick={() => {
                  // go to polygonscan explorer by address
                  window.open(
                    `https://polygonscan.com/address/${address}`,
                    "_blank"
                  );
                }}
              />
              <LitButton
                className="bg-error"
                icon="shutdown"
                hovertext="Logout"
                onClick={() => disconnect()}
              />
            </div>
          </div>

          {/* If not PKP was selected or not found */}
          {Object.keys(selectedPKP).length <= 0 ? (
            ""
          ) : (
            <div className="flex space-between pt-21">
              <div className="flex center-item h-30">
                <div className="flex flex-col">
                  <div className="flex gap-6">
                    <div className="flex center-item">
                      {/* svg green dot */}
                      <LitIcon
                        className="flex center-item"
                        icon={`${
                          selectedAddr === "eth" ? "greendot" : "greydot"
                        }`}
                      />
                    </div>
                    <div
                      onClick={() => setSelectedAddr("eth")}
                      className={`click-allowed text-sm ${
                        selectedAddr === "eth" ? "" : "txt-grey"
                      }`}
                    >
                      PKP:ETH:
                      {getShortAddress((selectedPKP as TokenInfo).ethAddress)}
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="flex center-item">
                      {/* svg green dot */}
                      <LitIcon
                        className="flex center-item"
                        icon={`${
                          selectedAddr === "btc" ? "greendot" : "greydot"
                        }`}
                      />
                    </div>
                    <div
                      onClick={() => setSelectedAddr("btc")}
                      className={`click-allowed text-sm ${
                        selectedAddr === "btc" ? "" : "txt-grey"
                      }`}
                    >
                      PKP:BTC:
                      {getShortAddress((selectedPKP as TokenInfo).btcAddress)}
                    </div>
                  </div>

                  {/* <div className="flex">
                  <LitIcon className="lit-icon" icon="btc" />
                </div> */}
                </div>
              </div>
              <div className="lit-mini-menu-icons flex gap-6">
                <LitButton
                  icon="copy"
                  hovertext="Copy"
                  onClick={() =>
                    handleCopy(
                      selectedAddr === "eth"
                        ? (selectedPKP as TokenInfo).ethAddress
                        : (selectedPKP as TokenInfo).btcAddress
                    )
                  }
                />
                <LitButton
                  icon="open-new"
                  hovertext="Explore"
                  onClick={() => {
                    // go to polygonscan explorer by address
                    if (selectedAddr === "eth") {
                      window.open(
                        `https://polygonscan.com/address/${
                          (selectedPKP as TokenInfo).ethAddress
                        }`,
                        "_blank"
                      );
                    }

                    if (selectedAddr === "btc") {
                      //  go to btc explorer by address
                      window.open(
                        `https://www.blockchain.com/btc/address/${
                          (selectedPKP as TokenInfo).btcAddress
                        }`,
                        "_blank"
                      );
                    }
                  }}
                />
              </div>
            </div>
          )}

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
                  {Object.keys(selectedPKP).length <= 0 ? (
                    <>
                      No PKP Connected, Click to Connect
                      <br />
                    </>
                  ) : (
                    <>
                      Connected:
                      {getShortAddress((selectedPKP as TokenInfo).tokenId)}{" "}
                      <br />
                    </>
                  )}
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
