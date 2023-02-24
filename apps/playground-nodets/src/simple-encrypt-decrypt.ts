import * as LitJsSdk from "@lit-protocol/lit-node-client";

(async () => {
  const litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: "serrano",
  });
  await litNodeClient.connect();

  const messageToEncrypt = "TESTING!";

  const chain = "ethereum";

  const authSig = {
    sig: "0x76275fc6949feed26015659fe5e949126c65e476c4d68838eb35e9fa5d2303ec5dfce3aeb3a551b5911a0ccfc957124726af028d904f699ef66627cadd0e15a51c",
    derivedVia: "web3.eth.personal.sign",
    signedMessage:
      "demo-encrypt-decrypt-react.vercel.app wants you to sign in with your Ethereum account:\n0x3B5dD260598B7579A0b015A1F3BBF322aDC499A1\n\n\nURI: https://demo-encrypt-decrypt-react.vercel.app/\nVersion: 1\nChain ID: 1\nNonce: 8uG5AhioZlmcX8Q0x\nIssued At: 2023-02-23T19:12:06.887Z\nExpiration Time: 2023-03-02T19:12:06.874Z",
    address: "0x3b5dd260598b7579a0b015a1f3bbf322adc499a1",
  };

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
})();
