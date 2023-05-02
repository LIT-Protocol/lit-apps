import { LitButton, ThemeDemo } from "ui";
import { use, useEffect, useState } from "react";
import * as LitJsSdk from "@lit-protocol/lit-node-client"; // <== include this
import "ui/theme.purple.css";
import "ui/theme.demo.css";
import { getLitDependenciesAndFile } from "../server-helper";

export default function SimpleEncryptDecryptDemo({
  litDependencies,
  thisFile,
  filename,
}: {
  litDependencies: Array<{ name: string; version: string }>;
  thisFile: string;
  filename: string;
}) {
  const [pageInfo, setPageInfo] = useState({
    title: "Simple Encrypt Decrypt",
    litDependencies,
  });

  const [editorInfo, setEditorInfo] = useState({
    lang: "typescript",
    code: thisFile,
  });

  const [editorRef, setEditorRef] = useState<any>(null);

  function onEditorReadyCallback(editor: any, monaco: any) {
    setEditorRef(editor);
  }

  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Starts
  const [secretMessage, setSecretMessage] = useState<string>(
    "🔥🔥🔥🔥🔥 THIS IS A SECRET MESSAGE 🔥🔥🔥🔥🔥 "
  );

  const go = async () => {
    setLoading(true);
    const litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: "serrano",
    });

    await litNodeClient.connect();

    const messageToEncrypt = secretMessage;

    const chain = "ethereum";

    const authSig = await LitJsSdk.checkAndSignAuthMessage({
      chain: "ethereum",
    });

    const accessControlConditions = [
      {
        contractAddress: "",
        standardContractType: "",
        chain: "ethereum",
        method: "eth_getBalance",
        parameters: [":userAddress", "latest"],
        returnValueTest: {
          comparator: ">=",
          value: "0", // 0 ETH, so anyone can open
        },
      },
    ];

    // 1. Encryption
    // <Blob> encryptedString
    // <Uint8Array(32)> symmetricKey
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(
      messageToEncrypt
    );

    // 2. Saving the Encrypted Content to the Lit Nodes
    // <Unit8Array> encryptedSymmetricKey
    const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    });

    // 3. Decrypt it
    // <String> toDecrypt
    const toDecrypt = LitJsSdk.uint8arrayToString(
      encryptedSymmetricKey,
      "base16"
    );

    // <Uint8Array(32)> _symmetricKey
    const _symmetricKey = await litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt,
      chain,
      authSig,
    });

    // <String> decryptedString
    let decryptedString;
    try {
      decryptedString = await LitJsSdk.decryptString(
        encryptedString,
        _symmetricKey
      );
    } catch (e) {
      console.log(e);
    }

    console.warn("decryptedString:", decryptedString);
    setResult(decryptedString ?? "");
    setLoading(false);
  };
  // Ends

  const onChange = (e: any) => {
    setEditorInfo({
      lang: "typescript",
      code: thisFile.replace(
        "🔥🔥🔥🔥🔥 THIS IS A SECRET MESSAGE 🔥🔥🔥🔥🔥 ",
        e.target.value
      ),
    });

    setSecretMessage(e.target.value);
  };

  return (
    <ThemeDemo
      pageInfo={pageInfo}
      editorInfo={editorInfo}
      onEditorReady={onEditorReadyCallback}
    >
      <div className="flex gap-12">
        <input
          placeholder="🔥 secret message.."
          type="text"
          onChange={onChange}
        />
        <button className="lit-button-2" onClick={go}>
          Go!
        </button>
      </div>
      <div className={`${!loading ? "inactive" : ""} loading`}>
        {loading ? "Loading..." : ""}
      </div>
      <div className={`${!result || loading ? "inactive" : ""} result`}>
        {result}
      </div>
    </ThemeDemo>
  );
}

export async function getStaticProps() {
  const { packageJson, litDependencies, thisFile } = getLitDependenciesAndFile([
    "@lit-protocol/lit-node-client",
  ]);

  return {
    props: {
      packageJson,
      litDependencies,
      thisFile,
    },
  };
}
