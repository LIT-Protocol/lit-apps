import { ThemeDemo } from "ui";
import { useState } from "react";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import "ui/theme.purple.css";

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

  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [secretMessage, setSecretMessage] = useState<string>(
    "🔥🔥🔥🔥🔥 THIS IS A SECRET MESSAGE 🔥🔥🔥🔥🔥 "
  );

  // --------------------------
  //          Starts
  // --------------------------
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
  // ------------------------
  //          Ends
  // ------------------------

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
    <ThemeDemo pageInfo={pageInfo} editorInfo={editorInfo}>
      <div className="flex gap-12">
        <input
          placeholder="🔥 secret message.."
          type="text"
          onChange={onChange}
        />
        <button onClick={go}>Go!</button>
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

// -- ignore starts
export async function getStaticProps() {
  const fs = require("fs");

  const filename =
    "./pages/" + __filename.split("/").pop()?.replace(".js", ".tsx");

  let thisFile = fs.readFileSync(filename, "utf8");

  const start = thisFile.indexOf("// -- ignore starts");
  const end = thisFile.lastIndexOf("// -- ends");

  thisFile = thisFile.substring(0, start) + thisFile.substring(end);

  //   remove the line // -- ends too
  thisFile = thisFile.replace("// -- ends", "");

  const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));

  const arr: Array<{ name: string; version: string }> = [];

  Object.keys(packageJson.dependencies).map((key) => {
    if (key.includes("@lit-protocol")) {
      arr.push({ name: key, version: packageJson.dependencies[key] });
    }
  });

  return {
    props: {
      packageJson,
      litDependencies: arr,
      thisFile,
    },
  };
}
// -- ends
