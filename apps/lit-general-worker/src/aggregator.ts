import express from "express";
import bodyParser from "body-parser";

const aggregator = express();
aggregator.use(bodyParser.json());

let cache = {
  cayenne: null,
  serrano: null,
};

// -- config
const mapper = {
  // -- Token
  litTokenContractAddress: "LITToken",

  // -- PKPs
  pkpNftContractAddress: "PKPNFTDiamond",
  pkpHelperContractAddress: "PKPHelperDiamond",
  pkpPermissionsContractAddress: "PKPPermissionsDiamond",
  pkpNftMetadataContractAddress: "PKPNFTMetadata",
  pubkeyRouterContractAddress: "PubkeyRouterDiamond",

  // --
  stakingBalancesContractAddress: "StakingBalances",
  stakingContractAddress: "Staking",
  multisenderContractAddress: "Multisender",

  // -- Rate Limit NFT
  rateLimitNftContractAddress: "RateLimitNFTDiamond",
  allowlistContractAddress: "Allowlist",
  resolverContractAddress: "Resolver",

  // -- Domain Wallet
  DomainWaleltRegistryAddress: "DomainWaleltRegistry",
  DomainWalletOracleAddress: "DomainWalletOracle",
  hdKeyDeriverContractAddress: "HDKeyDeriver",
};

const LOOKUP_API = `https://chain.litprotocol.com/api?module=account&action=txlist&address=`;
const ABI_API = `https://chain.litprotocol.com/api?module=contract&action=getabi&address=`;

const CAYENNE_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/cayenne/deployed-lit-node-contracts-temp.json';
const SERRANO_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/serrano/deployed-lit-node-contracts-temp.json';

aggregator.get("/contract-addresses", (req, res) => {
  if (cache.cayenne !== null && cache.cayenne.length > 0) {
    return res.json({ success: true, data: cache['cayenne'] });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Cayenne Cache not ready yet" });
  }
});

aggregator.get("/serrano-contract-addresses", (req, res) => {
  if (cache.serrano !== null && cache.serrano.length > 0) {
    return res.json({ success: true, data: cache['serrano'] });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Serrano Cache not ready yet" });
  }
});

// Update cache immediately when the server starts
updateCache('cayenne');
updateCache('serrano');

// Update cache every 5 minutes
setInterval(() => {
  updateCache('cayenne');
}, 5 * 60 * 1000);

setInterval(() => {
  updateCache('serrano');
}, 5 * 60 * 1000);


async function updateCache(network: 'cayenne' | 'serrano') {

  const API = network === 'cayenne' ? CAYENNE_CONTRACTS_JSON : SERRANO_CONTRACTS_JSON;

  const res = await fetch(API);

  const resData = await res.json();

  const data = [];

  for (const [name, address] of Object.entries(resData)) {

    if (mapper[name]) {

      if (network === 'cayenne') {
        const lookup = await fetch(`${LOOKUP_API}${address}`);

        const lookupData = await lookup.json();

        if (lookupData.result[1]?.timeStamp) {

          const date = new Date(lookupData.result[1].timeStamp * 1000).toISOString();

          const item = {
            name: mapper[name],
            contracts: [
              {
                address_hash: address,
                inserted_at: date,
                ABIUrl: `${ABI_API}${address}`,
              },
            ]
          }

          data.push(item)
        }

      } else {
        const item = {
          name: mapper[name],
          contracts: [
            {
              address_hash: address,
              inserted_at: "2023-04-26T23:00:00.000Z",
              ABIUrl: `${ABI_API}${address}`,
            },
          ]
        }

        data.push(item)
      }

    } else {
      console.log(`\x1b[33m%s\x1b[0m`, `❗️ "${name}" is not mapped`);
    }
  }
  cache[network] = data;

  console.log(`✅ Cache Updated for "${network}"`);
}

export { aggregator };
