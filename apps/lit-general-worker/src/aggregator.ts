import express from "express";
import bodyParser from "body-parser";

const aggregator = express();
aggregator.use(bodyParser.json());

type ContractInfo = {
  address_hash: string;
  block_hash: string | null;
  block_number: number;
  holder_count: number | null;
  inserted_at: string; // You might want to use Date if you're going to convert this string to a Date object
  name: string;
  symbol: string | null;
  tx_hash: string | null;
  type: "contract"; // Assuming 'type' will always have the value "contract"
  ABIUrl: string | null;
  creator: string | null;
};

let cache = {
  cayenne: null,
  serrano: null,
};
let lastUpdated: Date | null = null;




// -- config
const mapper = {
  // -- Token
  'litTokenContractAddress': 'LITToken',

  // -- PKPs
  'pkpNftContractAddress': 'PKPNFT',
  'pkpHelperContractAddress': 'PKPHelper',
  'pkpPermissionsContractAddress': 'PKPPermissions',
  'pkpNftMetadataContractAddress': 'PKPNFTMetadata',
  'pubkeyRouterContractAddress': 'PubkeyRouter',

  // -- 
  "stakingBalancesContractAddress": "StakingBalances",
  "stakingContractAddress": "Staking",
  "multisenderContractAddress": "Multisender",

  // -- Rate Limit NFT
  "rateLimitNftContractAddress": "RateLimitNFT",
  "allowlistContractAddress": "Allowlist",
  "resolverContractAddress": "Resolver",

  // -- Domain Wallet
  "DomainWaleltRegistryAddress": "DomainWaleltRegistry",
  "DomainWalletOracleAddress": "DomainWalletOracle",
  "hdKeyDeriverContractAddress": "HDKeyDeriver",
}

// const CONTRACT_API = `https://chain.litprotocol.com/token-autocomplete?q=`;
const LOOKUP_API = `https://chain.litprotocol.com/api?module=account&action=txlist&address=`;
const ABI_API = `https://chain.litprotocol.com/api?module=contract&action=getabi&address=`;

const CAYENNE_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/cayenne/deployed-lit-node-contracts-temp.json';
const SERRANO_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/serrano/deployed-lit-node-contracts-temp.json';

// const DEPLOYER_ADDRESSES = [
//   "0x046bf7bb88e0e0941358ce3f5a765c9acdda7b9c",
//   "0xa54b67b7d202f0516c340e18169882ec9b6f88d8",
//   "0xe964c013414d2d2c34c9bd319a52cf334e8bddb7",
//   "0xd875480fde946c74ecaf71bb643cbe9f2e68e5a8",

//   // If user provide it in process.env, then combine it with the default ones
//   ...(process.env.DEPLOYER_ADDRESSES || "").split(","),
// ];

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
