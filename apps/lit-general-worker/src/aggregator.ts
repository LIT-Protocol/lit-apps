import express from "express";
import bodyParser from "body-parser";
// import * as dotenv from "dotenv";
// dotenv.config();

// https://github.com/LIT-Protocol/lit-assets/tree/develop/rust/lit-core/lit-blockchain/abis
// -- config
const TOKEN = process.env.GITHUB_LIT_ASSETS_REAL_ONLY_API;
const USERNAME = 'LIT-Protocol'
const REPO_NAME = 'lit-assets';

const createPath = (PATH: string) => {
  return `https://api.github.com/repos/${USERNAME}/${REPO_NAME}/contents/${PATH}`;
}

const HEADER = {
  headers: {
    Authorization: `token ${TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
};

const aggregator = express();
aggregator.use(bodyParser.json());

let cache = {
  cayenne: null,
  serrano: null,
};

// https://github.com/LIT-Protocol/lit-assets/blob/develop/blockchain/contracts/deployed_contracts_cayenne.json
// https://github.com/LIT-Protocol/lit-assets/blob/develop/blockchain/contracts/deployed_contracts_serrano.json

// -- config
// This mapper maps to the contract FILE name, not the contract name. For example, PKPPermissions is the file name without extension, while the contract name may be different. eg. PKPPermissionsDiamond
const mapper = {
  // -- Token
  litTokenContractAddress: "LITToken",

  // -- PKPs
  pkpNftContractAddress: "PKPNFT",
  pkpHelperContractAddress: "PKPHelper",
  pkpPermissionsContractAddress: "PKPPermissions",
  pkpNftMetadataContractAddress: "PKPNFTMetadata",
  pubkeyRouterContractAddress: "PubkeyRouter",

  // --
  stakingBalancesContractAddress: "StakingBalances",
  stakingContractAddress: "Staking",
  multisenderContractAddress: "Multisender",

  // -- Rate Limit NFT
  rateLimitNftContractAddress: "RateLimitNFT",
  allowlistContractAddress: "Allowlist",
  // resolverContractAddress: "Resolver",

  // -- Domain Wallet
  // DomainWaleltRegistryAddress: "DomainWaleltRegistry",
  // DomainWalletOracleAddress: "DomainWalletOracle",
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

export async function getLitContractABIs() {

  const contractsData = [];

  console.log(`Getting directory...`);

  const filesRes = await fetch(createPath('rust/lit-core/lit-blockchain/abis'), HEADER);

  const files = await filesRes.json();

  for (const file of files) {

    const name = file.name.replace('.json', '');

    if (!Object.values(mapper).includes(name)) {
      continue;
    }

    console.log(`Getting file ${file.download_url}`);

    const fileRes = await fetch(file.download_url, HEADER);

    const fileData = await fileRes.json();

    contractsData.push({
      name: file.name.replace('.json', ''),
      contractName: fileData.contractName,
      data: fileData.abi,
    });
  }

  if (!contractsData.length) {
    throw new Error('No data');
  }

  return contractsData;
}

async function updateCache(network: 'cayenne' | 'serrano') {

  const API = network === 'cayenne' ? CAYENNE_CONTRACTS_JSON : SERRANO_CONTRACTS_JSON;

  let cayenneDiamondData = null;

  if (network === 'cayenne') {
    cayenneDiamondData = await getLitContractABIs();
    // console.log("cayenneDiamondData:", cayenneDiamondData);
  }

  const res = await fetch(API);

  const resData = await res.json();

  const data = [];

  for (const [name, address] of Object.entries(resData)) {

    const contractFileName = mapper[name];

    if (contractFileName) {

      if (network === 'cayenne') {
        const lookup = await fetch(`${LOOKUP_API}${address}`);

        const lookupData = await lookup.json();

        if (lookupData.result[1]?.timeStamp) {

          const date = new Date(lookupData.result[1].timeStamp * 1000).toISOString();

          const ABI = cayenneDiamondData.find((item) => item.name === contractFileName);

          console.log("contractFileName:", contractFileName);

          if (!Object.values(mapper).includes(contractFileName)) {
            continue;
          }

          const item = {
            name: contractFileName,
            contracts: [
              {
                network: 'cayenne',
                address_hash: address,
                inserted_at: date,
                ABI: ABI.data,
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
              network: 'serrano',
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
