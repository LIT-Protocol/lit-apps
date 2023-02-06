import * as bitcoinjs from "bitcoinjs-lib";
import { Contract, ethers } from "ethers";
import { computeAddress } from "ethers/lib/utils";

// {
//   tokenId: pkpTokenId,
//   publicKey,
//   publicKeyBuffer: pubkeyBuffer,
//   ethAddress,
//   btcAddress,
//   isNewPKP,
// };
export type TokenInfo = {
  tokenId: string;
  publicKey: string;
  publicKeyBuffer: Buffer;
  ethAddress: string;
  btcAddress: string;
  isNewPKP: boolean;
};

export const ECDSAAddresses = async ({
  publicKey,
  pkpTokenId,
  pkpContractAddress,
  defaultRPCUrl,
  options = {
    cacheContractCall: false,
  },
}: {
  publicKey?: string;
  pkpTokenId?: string;
  pkpContractAddress?: string;
  defaultRPCUrl?: string;
  options?: {
    cacheContractCall?: boolean;
  };
}): Promise<TokenInfo> => {
  let pubkeyBuffer: Buffer;

  // one of the two must be provided
  if (!publicKey && !pkpTokenId) {
    throw new Error("publicKey or pkpTokenId must be provided");
  }

  // if pkp contract address is not provided, use the default one 0xEA287AF8d8835eb20175875e89576bf583539B37
  if (!pkpContractAddress) {
    pkpContractAddress = "0xEA287AF8d8835eb20175875e89576bf583539B37";
  }

  // if default RPC url is not provided, use the default one https://endpoints.omniatech.io/v1/matic/mumbai/public
  if (!defaultRPCUrl) {
    defaultRPCUrl = "https://endpoints.omniatech.io/v1/matic/mumbai/public";
  }

  // if pkpTokenId is provided, get the public key from it

  let isNewPKP = false;

  if (pkpTokenId) {
    // try to get the public key from 'lit-cached-pkps' local storage
    const CACHE_KEY = "lit-cached-pkps";
    try {
      const cachedPkp = localStorage.getItem(CACHE_KEY);
      if (cachedPkp) {
        const cachedPkpJSON = JSON.parse(cachedPkp);
        if (cachedPkpJSON[pkpTokenId]) {
          publicKey = cachedPkpJSON[pkpTokenId];
        } else {
          const provider = new ethers.providers.JsonRpcProvider(defaultRPCUrl);

          const contract = new Contract(
            pkpContractAddress,
            ["function getPubkey(uint256 tokenId) view returns (bytes memory)"],
            provider
          );

          publicKey = await contract.getPubkey(pkpTokenId);
          isNewPKP = true;
        }
      }
    } catch (e) {
      console.error(e);
    }

    // trying to store key value pair in local storage
    if (options.cacheContractCall) {
      try {
        const cachedPkp = localStorage.getItem(CACHE_KEY);
        if (cachedPkp) {
          const cachedPkpJSON = JSON.parse(cachedPkp);
          cachedPkpJSON[pkpTokenId] = publicKey;
          localStorage.setItem(CACHE_KEY, JSON.stringify(cachedPkpJSON));
        } else {
          const cachedPkpJSON = {};
          cachedPkpJSON[pkpTokenId] = publicKey;
          localStorage.setItem(CACHE_KEY, JSON.stringify(cachedPkpJSON));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  if (publicKey === undefined) {
    console.warn("publicKey is undefined");
  }

  // if publicKey is provided, validate it
  if (publicKey) {
    if (publicKey.startsWith("0x")) {
      publicKey = publicKey.slice(2);
    }
    pubkeyBuffer = Buffer.from(publicKey, "hex");
  }

  // get the address from the public key
  const ethAddress = computeAddress(pubkeyBuffer);

  // get the btc address from the public key
  const btcAddress = bitcoinjs.payments.p2pkh({
    pubkey: pubkeyBuffer,
  }).address;

  return {
    tokenId: pkpTokenId,
    publicKey,
    publicKeyBuffer: pubkeyBuffer,
    ethAddress,
    btcAddress,
    isNewPKP,
  };
};
