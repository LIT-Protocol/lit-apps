import MonacoEditor from "@monaco-editor/react";
import React, { useEffect } from "react";
import beautify from "json-beautify";

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
} from "ui";
import { validateParams } from "@lit-dev/utils/util-param-validator";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { JsonAuthSig } from "@lit-protocol/constants";
import { useAccount } from "wagmi";
import Router from "next/router";
import toast from "react-hot-toast";

export function Custom() {
  const { address, isConnected } = useAccount();

  const { pkpConnected } = usePKPConnectionContext();

  // ---------------------------------------
  //          Default form values
  // ---------------------------------------
  const [jsCode, setJsCode] = React.useState(`(async () => {
// lit action code goes here
})();`);

  const [jsonCode, setJsonCode] = React.useState(
    beautify(
      {
        tokens: [
          {
            chainId: 137,
            decimals: 18,
            address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270",
            symbol: "WMATIC",
            name: "Wrapped Matic",
          },
          {
            chainId: 137,
            decimals: 6,
            address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
            symbol: "USDC",
            name: "USD//C",
          },
        ],
        pkpPublicKey:
          "0x0499713b16636af841756431b73bd1a88d1837d110ae981ff3711c9239af95d8849b149fb6f2d46697b4d75c62ae4e63f8b8b941d4ca0a06a02b8b47d12f42b61d",
        strategy: [
          { token: "USDC", percentage: 52 },
          { token: "WMATIC", percentage: 48 },
        ],
        conditions: {
          maxGasPrice: 75,
          unit: "gwei",
          minExceedPercentage: 1,
          unless: {
            spikePercentage: 15,
            adjustGasPrice: 500,
          },
        },
        rpcUrl: "https://polygon.llamarpc.com",
        dryRun: false,
      },
      // @ts-ignore
      null,
      2
    )
  );

  const [events, setEvents] = React.useState([
    {
      name: "events",
      type: "label",
    },
    {
      name: "periodic event",
      enabled: true,
    },
    {
      name: "block event",
      enabled: true,
    },
    {
      name: "webhook event",
      enabled: true,
    },
    {
      name: "contract event",
      enabled: true,
    },
    {
      name: "transaction event",
      enabled: true,
    },
  ]);

  const [selectedEvent, setSelectedEvent] = React.useState("");
  const [msg, setMsg] = React.useState<{
    color: string | null;
    messages: Array<string> | null;
  }>({
    color: null,
    messages: null,
  });

  const [name, setName] = React.useState("");

  const [formReady, setFormReady] = React.useState(false);

  const [litNodeClient, setLitNodeClient] = React.useState<any>();

  const [_isConnected, setIsConnected] = React.useState(false);

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
  }, [jsonCode, jsCode, selectedEvent, events, litNodeClient, isConnected]);

  // ------------------------------------------------
  //          Event: Click Register Button
  // ------------------------------------------------
  const onRegister = async () => {
    // -- validata params
    const check_1 = validateParams("must_have", [
      { selectedEvent },
      { jsCode },
      { jsonCode },
      { name },
    ]);

    const check_2 = validateParams("is_json", [{ jsonCode }]);

    if (!check_1.validated || !check_2.validated) {
      // scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      setMsg({
        color: "red",
        messages: check_1.message ? check_1.message : check_2.message,
      });

      return;
    }
    resetMessage();

    // -- check auth message
    let authSig: JsonAuthSig;
    authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: "mumbai",
    });

    // -- ok, let's test run the lit action code without params
    // try {
    //   const res = await litNodeClient.executeJs({
    //     authSig,
    //     code: jsCode,
    //     jsParams: {},
    //   });
    //   console.log(res);
    // } catch (e) {
    //   setMsg({
    //     color: 'red',
    //     text: `[${e.name} (${e.errorCode})]: ${e.message}}`,
    //   });
    //   return;
    // }

    const randomString = (length: number) => {
      let result = "";
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const charactersLength = characters.length;
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }
      return result;
    };

    const sizeTest = randomString(250000);

    // -- ok, let's register the lit action
    const res = await fetch("/api/register", {
      method: "post",
      body: JSON.stringify({
        code: `
        (async () => {
          var sizeTest = '${sizeTest}';
          if ( sizeTest.length !== 250000 ) {

            throw new Error('sizeTest.length !== 250000');
          }
        })();
        `,
        jsParams: jsonCode,
        authSig,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();

    console.log("data:", data);
  };

  const beautifyJson = () => {
    if (jsonCode) {
      try {
        setJsonCode(JSON.stringify(DJSON.parse(jsonCode), null, 2));
      } catch (e: any) {
        // setMsg({
        //   color: "red",
        //   messages: [`[Error]: ${e.message}`],
        // });
        toast.error(e.message);
      }
    }
  };

  return (
    <div className="flex-col max-width-880">
      <DebugViewer
        states={[
          { formReady },
          { selectedEvent },
          { jsCode },
          { jsonCode },
          { msg },
          { name },
          { litNodeClient: litNodeClient ? "true" : "false" },
        ]}
      />

      <ul>
        <li>We are using Event Listener auth sig for the requests</li>
        <li>
          Because the Lit Action should verify the condition before running
        </li>
        <li>
          The model is, the user permits the lit action to use their PKP which
          anybody could run
        </li>
      </ul>

      <div className="cls-app">
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
          //          INPUT: Lit Action Name                                    
          // ------------------------------------------
          */}
          <div className="cls-input w-full">
            <input
              className="Input"
              type="text"
              id="firstName"
              placeholder="name your lit action"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* 
          // -------------------------------------
          //          INPUT: Event Type                                    
          // -------------------------------------
          */}
          <div className="">
            <SelectMenu
              label="Select an event"
              onChange={setSelectedEvent}
              items={events}
            />
          </div>
        </div>

        <div className="h-24"></div>

        {/* 
        // ------------------------------------------
        //          INPUT: Lit Action Code                                    
        // ------------------------------------------
        */}
        <div className="cls-code">
          <div className="MonacoEditor">
            <MonacoEditor
              language="javascript"
              value={jsCode}
              onChange={(e: any) => setJsCode(e)}
              theme="vs-dark"
              // height="200px"
            />
          </div>
        </div>

        <div className="h-24"></div>
        {/* 
        // -------------------------------------------------
        //          INPUT: Lit Action JSON Params                                    
        // -------------------------------------------------
        */}
        <div className="cls-code">
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
              // height="200px"
            />
          </div>
        </div>

        <div className="h-24"></div>
        {/* 
        // ----------------------------------------
        //          INPUT: Submit Button                                    
        // ----------------------------------------
        */}
        <LitButton onClick={onRegister}>Register</LitButton>
      </div>
    </div>
  );
}

export default Custom;
