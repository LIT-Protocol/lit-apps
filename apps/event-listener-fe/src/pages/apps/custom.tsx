import MonacoEditor from "@monaco-editor/react";
import { useEffect, useReducer, useState } from "react";
import beautify from "json-beautify";
import { LitContracts } from "@lit-protocol/contracts-sdk";
import { JsonRpcProvider } from "@ethersproject/providers";

// @ts-ignore
import DJSON from "dirty-json";

import {
  SelectMenu,
  DebugViewer,
  LitButton,
  LitIcon,
  LitHeaderV1,
  usePKPConnectionContext,
  LitHero,
  StateReducer,
  LitLoading,
  LitNote,
  LitSelectionV1,
} from "ui";
import { validateParams } from "@lit-dev/utils/util-param-validator";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { JsonAuthSig } from "@lit-protocol/constants";
import { useAccount } from "wagmi";
import Router from "next/router";
import toast from "react-hot-toast";
import { getShortAddress, safeFetch } from "@lit-dev/utils";
import { ELNotes } from "../../components/ELNotes";

export function Custom() {
  const { address, isConnected } = useAccount();

  const { pkpConnected, selectedPKP } = usePKPConnectionContext();

  const [state, dispatch] = useReducer(StateReducer, {
    data: [],
    loading: false,
  });

  const [eventState, dispatchEventState] = useReducer(StateReducer, {
    data: [],
    loading: false,
  });

  // ---------------------------------------
  //          Default form values
  // ---------------------------------------
  const [jsCode, setJsCode] = useState();

  const [jsonCode, setJsonCode] = useState();

  const [events, setEvents] = useState([
    {
      name: "block",
      enabled: true,
    },
    {
      name: "periodic",
      enabled: false,
    },
    {
      name: "webhook",
      enabled: false,
    },
    {
      name: "contract",
      enabled: false,
    },
    {
      name: "transaction",
      enabled: false,
    },
  ]);

  const [selectedEvent, setSelectedEvent] = useState("");
  const [msg, setMsg] = useState<{
    color: string | null;
    messages: Array<string> | null;
  }>({
    color: null,
    messages: null,
  });

  const [name, setName] = useState("");

  const [formReady, setFormReady] = useState(false);

  const [litNodeClient, setLitNodeClient] = useState<LitNodeClient>();

  const [_isConnected, setIsConnected] = useState(false);

  const [firstLoaded, setFirstLoaded] = useState(false);

  const [jsonRpcProvider, setJsonRpcProvider] = useState<any>();
  const [currentBlockNumber, setCurrentBlockNumber] = useState(0);

  const resetMessage = () => {
    setMsg({
      color: null,
      messages: null,
    });
  };

  // ------------------------------
  //          Use Effect
  // ------------------------------
  useEffect(() => {
    setIsConnected(isConnected);

    if (!jsonRpcProvider && !currentBlockNumber) {
      const provider = new JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
      setJsonRpcProvider(provider);

      provider.on("block", async (blockNumber: number) => {
        if (blockNumber > currentBlockNumber) {
          setCurrentBlockNumber(blockNumber);
        }
      });
    }

    if (!jsCode && !jsonCode && !firstLoaded) {
      (async () => {
        const res: any = await fetch("/api/demo-code").then((res) =>
          res.json()
        );
        setJsCode(res.code);
        setJsonCode(res.jsParams);
        setFirstLoaded(true);
      })();
    }

    if (!isConnected || !pkpConnected) {
      // this will redirect back to this page after login
      const { pathname } = Router;

      // set redirect to local storage
      localStorage.setItem("redirect", pathname);

      if (pathname !== "/login") {
        Router.push("/login");
      }
    }

    // -- check if the form is ready
    if (selectedEvent && jsCode && jsonCode) {
      setFormReady(true);
    } else {
      setFormReady(false);
    }

    // -- init LitJsSdk
    if (!litNodeClient) {
      (async () => {
        const client = new LitNodeClient({
          litNetwork: "serrano",
          debug: false,
        });

        await client.connect();

        setLitNodeClient(client);
      })();
    }
  }, [
    jsonCode,
    jsCode,
    selectedEvent,
    events,
    litNodeClient,
    isConnected,
    jsonRpcProvider,
  ]);

  const beautifyJson = () => {
    if (jsonCode) {
      try {
        // @ts-ignore
        setJsonCode(JSON.stringify(DJSON.parse(jsonCode), null, 2));
      } catch (e: any) {
        toast.error(e.message);
        // throw new Error(e.message);
      }
    }
  };

  const runPipeline = async () => {
    const check_1 = validateParams("must_have", [
      {
        "Lit Action Code": jsCode,
        JsParams: jsonCode,
        litNodeClient,
      },
    ]);

    const check_2 = validateParams("is_json", [{ JsParams: jsonCode }]);

    if (!check_1.validated || !check_2.validated) {
      const messages = [...check_1.message, ...check_2.message];

      // scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setMsg({
        color: "red",
        messages,
      });

      return;
    }

    resetMessage();

    // -- get auth sig
    dispatch({
      type: "LOADING",
      loadingMessage: "Checking and Signing Auth Message...",
    });

    let authSig: JsonAuthSig;

    try {
      authSig = await LitJsSdk.checkAndSignAuthMessage({
        chain: "mumbai",
      });

      console.log("authSig:", authSig);
    } catch (e: any) {
      dispatch({ type: "SET_DATA" });
      toast.error(e.message);
      return;
    }

    // -- upload lit ction
    dispatch({
      type: "LOADING",
      loadingMessage: "Uploading Lit Action...",
    });

    const registerData = await safeFetch(
      "/api/register-lit-action",
      jsCode,
      (e: Error) => {
        dispatch({ type: "SET_DATA" });
        toast.error(e.message);
      }
    );

    console.log("registerData:", registerData);

    // -- permit lit action to use the pkp
    dispatch({
      type: "LOADING",
      loadingMessage: "Permitting Lit Action to use PKP...",
    });

    const contract = new LitContracts();
    await contract.connect();

    let addPermittedActionRes;

    try {
      addPermittedActionRes =
        await contract.pkpPermissionsContractUtil.write.addPermittedAction(
          selectedPKP.tokenId,
          registerData.data.IpfsHash
        );
      console.log("addPermittedActionRes:", addPermittedActionRes);
    } catch (e: any) {
      toast.error("Error permitting action");
      console.error("e:", e);
      dispatch({ type: "SET_DATA" });
      return;
    }

    // -- submit job
    dispatch({
      type: "LOADING",
      loadingMessage: "Submitting Job...",
    });

    const submitData = await safeFetch(
      "/api/submit-job",
      {
        ownerAddress: address,
        pkpInfo: selectedPKP,
        ipfsId: registerData.data.IpfsHash,
        jsParams: jsonCode,
        eventType: selectedEvent,
        eventParams: eventState.data,
      },
      (e: Error) => {
        toast.error(e.message);
        dispatch({ type: "SET_DATA" });
      }
    );

    console.log("submitData:", submitData);

    dispatch({
      type: "SET_DATA",
    });

    toast.success("Job Submitted Successfully. Create another one?");

    // -- test run the lit action
    // dispatch({
    //   type: "LOADING",
    //   loadingMessage: `Testing Lit Action as ${authSig.address}...`,
    // });

    // try {
    //   const testRun = await litNodeClient.executeJs({
    //     targetNodeRange: 1,
    //     ipfsId: registerData.data.IpfsHash,
    //     authSig: {
    //       sig: "0xddb97f4cbbabce6a17286a83663d14e1d71615618957f49b63a0724de2e633ce55c7d40a0697e3bdede7835728d7780b8acdf4e9c671656ed2b76ef5bcf0f10e1c",
    //       derivedVia: "web3.eth.personal.sign",
    //       signedMessage:
    //         "demo-encrypt-decrypt-react.vercel.app wants you to sign in with your Ethereum account:\n0x6581E39d310bD0C1B31Dcb215A9e673183bA7E93\n\n\nURI: https://demo-encrypt-decrypt-react.vercel.app/\nVersion: 1\nChain ID: 1\nNonce: HIzNO80hhLocavRgh\nIssued At: 2023-02-07T18:16:24.228Z\nExpiration Time: 2023-02-14T18:16:17.098Z",
    //       address: "0x6581e39d310bd0c1b31dcb215a9e673183ba7e93",
    //     },
    //     jsParams,
    //   });

    //   console.log("testRun:", testRun);
    // } catch (e: any) {
    //   dispatch({ type: "SET_DATA" });
    // }
    // dispatch({ type: "SET_DATA" });
  };

  const test = async () => {
    const res = await safeFetch("/api/get-jobs");

    console.log("res:", res);
  };

  return (
    <div className="flex-col">
      {/* <DebugViewer
        states={[
          { formReady },
          { selectedEvent },
          { jsCode },
          { jsonCode },
          { msg },
          { name },
          { litNodeClient: litNodeClient ? "true" : "false" },
        ]}
      /> */}
      {/* 
      <ul>
        <li>We are using Event Listener auth sig for the requests</li>
        <li>
          Because the Lit Action should verify the condition before running
        </li>
        <li>
          The model is, the user permits the lit action to use their PKP which
          anybody could run
        </li>
      </ul> */}
      {/* <LitButton onClick={test}>Test</LitButton> */}

      <div className="cls-app max-width-1024">
        {/* 
        // --------------------------------
        //          Message area                                    
        // --------------------------------
        */}
        <div
          className={`${msg.messages !== null ? "active" : ""} wrapper-message`}
        >
          <ul className={`cls-message ${msg?.color}`}>
            {msg?.messages?.map((item, index) => {
              return <li key={index}>{item}</li>;
            })}
          </ul>
        </div>
        <div className="flex space-between gap-12">
          {/* 
        // ------------------------------------------
        //          INPUT: Lit Action Code                                    
        // ------------------------------------------
        */}
          <div className="cls-code">
            <h1>Lit Action</h1>
            <div className="MonacoEditor">
              <MonacoEditor
                language="javascript"
                value={jsCode}
                onChange={(e: any) => setJsCode(e)}
                theme="vs-dark"
                options={{
                  wordWrap: "on",
                  fontSize: 10,
                  minimap: {
                    enabled: true,
                  },
                }}
              />
            </div>
          </div>

          {/* 
        // -------------------------------------------------
        //          INPUT: Lit Action JSON Params                                    
        // -------------------------------------------------
        */}
          <div className="cls-code cls-js-params">
            <h1>JS Parameters</h1>
            <div className="MonacoEditor">
              <div className="flex mb-4">
                <LitButton
                  className="lit-button-6 justify-center"
                  onClick={beautifyJson}
                >
                  Beautify
                </LitButton>
              </div>
              <MonacoEditor
                language="json"
                value={jsonCode}
                onChange={(e: any) => setJsonCode(e)}
                theme="vs-dark"
                options={{
                  wordWrap: "on",
                  fontSize: 10,
                  minimap: {
                    enabled: false,
                  },
                }}
              />
            </div>
          </div>
        </div>
        {/* 
        // -----------------------------------
        //          Select Interval                                    
        // -----------------------------------
        */}
        <div className="h-12"></div>

        <div className="flex gap-12">
          {/* 
          // -------------------------------------
          //          INPUT: Event Type                                    
          // -------------------------------------
        */}
          <div className="cls-code">
            <h1>Event</h1>
            <div className="flex gap-12">
              <div className="grid grid-cols-4 gap-6">
                <LitSelectionV1
                  items={events}
                  button={{
                    component: LitButton,
                    className: "lit-mini-button capitalize",
                  }}
                  onClick={(item: { name: string }) => {
                    setSelectedEvent(item.name);
                  }}
                />
              </div>
            </div>
          </div>
          {/* 
            // ------------------------------------------
            //          Selected Event Options                                    
            // ------------------------------------------
           */}
          <div className="cls-code">
            <h1 className="invisible">*</h1>
            {/* {JSON.stringify(eventState.data)} */}
            {/* "Block Event Options" */}
            {false ? (
              ""
            ) : (
              <div className="flex flex-col gap-4 relative">
                <div className="lit-block-number">
                  <span>
                    <LitIcon icon="greendot"></LitIcon>
                  </span>
                  <span>{currentBlockNumber}</span>
                </div>
                <div className="lit-input-v1">
                  <label>Start Block</label>
                  <input
                    type="text"
                    id="firstName"
                    onChange={(e) => {
                      dispatchEventState({
                        type: "SET_DATA",
                        payload: {
                          startBlock: e.target.value,
                        },
                      });
                    }}
                  />
                </div>
                <div className="lit-input-v1 text-xs txt-grey text-right flex gap-6">
                  <LitButton className="lit-mini-button active">
                    Repeat until
                  </LitButton>
                  <LitButton className="lit-mini-button  disabled">
                    Repeat every x blocks
                  </LitButton>
                </div>
                <div className="lit-input-v1">
                  <label>End Block</label>
                  <input
                    type="text"
                    id="firstName"
                    onChange={(e) =>
                      dispatchEventState({
                        type: "SET_DATA",
                        payload: {
                          endBlock: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 
        // --------------------------
        //          Upload                                    
        // -------------------------- 
        */}
        <div className={`animate ${!selectedEvent ? "disabled" : ""}`}>
          <div className="h-12"></div>
          <ELNotes />
          <div className="h-12"></div>
          {/* -- if it's not loading */}
          {!state.loading ? (
            <div className="flex flex-col">
              <LitButton onClick={runPipeline}>Create</LitButton>
            </div>
          ) : (
            // -- if it's loading
            <div className="mb-12 flex center-item justify-center">
              <LitLoading icon="lit-logo" text={state.loadingMessage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Custom;
