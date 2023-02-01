/**
 * Convert PKP public key to Ethereum address
 * @param { string } pubKey public key
 * @returns { string } Ethereum address
 *
 * @example
 * Public Key: 04c9ebb41c4b40177565c63997cf2bd88d0dbc6cdd343700ed0cbb45a3ce89744808abcc549de6fd045d55fe8d5fc292164c71ca0fb2f6e2db3f5ce0a323e65067
 * ETH Address: 0x070e90befc1e8ec3eD7398B86b858F6D6a6E91fC
 *
 */
export const publicKeyToEthAddress = (pubKey: string) => {
  // const _pubKey = '025f37d20e5b18909361e0ead7ed17c69b417bee70746c9e9c2bcb1394d921d4ae';
  // const _pubKey = '03798a539c18f8209bddb6d79d72a954aad6ce8e24faef231637ed1a8278b419fb';
  const _pubKey = pubKey?.replaceAll("0x", "");

  const EC = require("elliptic").ec;
  const keccak256 = require("js-sha3").keccak256;

  let address: string;

  try {
    const ec = new EC("secp256k1");

    // Decode public key
    const key = ec.keyFromPublic(_pubKey, "hex");
    // console.log("[pub2Addr] converted<key>:", key);

    // Convert to uncompressed format
    const publicKey = key.getPublic().encode("hex").slice(2);

    // Now apply keccak
    address = keccak256(Buffer.from(publicKey, "hex")).slice(64 - 40);
    console.log("[pub2Addr] converted<publicKey>:", publicKey);
    console.log("[pub2Addr] converted<address>:", address);
  } catch (err) {
    throw new Error(err);
  }

  // prepend '0x' to address if not present
  if (address.slice(0, 2) !== "0x") {
    address = "0x" + address;
  }

  return address;
};
