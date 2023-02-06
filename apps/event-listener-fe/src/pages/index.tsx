import MonacoEditor from "@monaco-editor/react";
import React, { useEffect } from "react";
import beautify from "json-beautify";

import { SelectMenu, DebugViewer, LitButton, LitIcon, LitHeaderV1 } from "ui";
import { validateParams } from "../../../../packages/utils/util-param-validator";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { JsonAuthSig } from "@lit-protocol/constants";
import { useAccount } from "wagmi";
import Router from "next/router";

export function Index() {
  const { address, isConnected } = useAccount();

  // ---------------------------------------
  //          Default form values
  // ---------------------------------------
  const [jsCode, setJsCode] = React.useState(`(async () => {
// lit action code goes here
})();`);

  const [jsonCode, setJsonCode] = React.useState(
    beautify(
      {
        sig: "exmaple-lit-action-sig",
        pubKey: "123",
      },
      [],
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

    if (!isConnected) {
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

  return (
    <div className="flex-col">
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

      <LitHeaderV1 title="Lit Actions Event Listener" />

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
              height="200px"
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
            <MonacoEditor
              language="json"
              value={jsonCode}
              onChange={(e: any) => setJsonCode(e)}
              theme="vs-dark"
              height="200px"
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

export default Index;
