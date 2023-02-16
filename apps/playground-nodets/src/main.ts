import * as LitJsSdk from "@lit-protocol/lit-node-client";

(async () => {
  const client = new LitJsSdk.LitNodeClient({
    litNetwork: "serrano",
    debug: false,
  });

  await client.connect();

  console.log("Getting price!");
  const res = await client.executeJs({
    authSig: {
      sig: "0x87ad8ed92fd3d0d0f99686781202918f0ca78373db811c81b1af41f3f3d9a9690258f7459dbcad08f10f8b1ebb1d2dd55f353fea26522f69f8aa0f150c8e7d2f1c",
      derivedVia: "web3.eth.personal.sign",
      signedMessage:
        "demo-encrypt-decrypt-react.vercel.app wants you to sign in with your Ethereum account:\n0x8A82174Ff0dCAE1cD02474f10143ee0d834c2b26\n\n\nURI: https://demo-encrypt-decrypt-react.vercel.app/\nVersion: 1\nChain ID: 1\nNonce: nDH2rCbQ88PuyWmui\nIssued At: 2023-02-14T16:11:36.565Z\nExpiration Time: 2023-02-21T16:11:36.551Z",
      address: "0x8a82174ff0dcae1cd02474f10143ee0d834c2b26",
    },
    ipfsId: "QmP8Ws87bRq9vgM3VQJ4fuK6AnukEPqSnSC3x6EMYMhBFw",
    jsParams: {
      tokenSymbol: "ETH",
    },
  });

  console.log("res:", res);
})();
