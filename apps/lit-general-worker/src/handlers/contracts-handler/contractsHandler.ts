import express from "express";
import bodyParser from "body-parser";
// import * as dotenv from "dotenv";
// dotenv.config();
//
// https://github.com/LIT-Protocol/lit-assets/tree/develop/rust/lit-core/lit-blockchain/abis
// -- config
const TOKEN = process.env.GITHUB_LIT_ASSETS_REAL_ONLY_API;
const USERNAME = 'LIT-Protocol'
const REPO_NAME = 'lit-assets';

const createPath = (PATH: string) => {
  return `https://api.github.com/repos/${USERNAME}/${REPO_NAME}/contents/${PATH}`;
}

function extractPathAfterMain(urlString: string): string {
  const url = new URL(urlString);
  const pathname = url.pathname;
  const parts = pathname.split('/');
  const mainIndex = parts.indexOf('main');
  const desiredPath = parts.slice(mainIndex + 1).join('/');
  return desiredPath;
}

async function getLastModified(filePath: string) {
  const fileAPI = `https://api.github.com/repos/${USERNAME}/networks/commits?path=${filePath}`;
  try {
    const response = await fetch(fileAPI, HEADER);
    const commits = await response.json();

    // If there are commits, return the date of the most recent one.
    if (commits.length > 0) {
      return commits[0].commit.author.date;
    }
    console.error('No commits found for', filePath);
    return null;
  } catch (error) {
    console.error('Error fetching last modified date:', error);
  }
}

const HEADER = {
  headers: {
    Authorization: `token ${TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  },
};

const contractsHandler = express();
contractsHandler.use(bodyParser.json());

let cache = {
  cayenne: null,
  serrano: null,
  internalDev: {
    config: null,
    data: null,
  },
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
const INTERNAL_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/internal-dev/deployed-lit-node-contracts-temp.json';

contractsHandler.get("/contract-addresses", (req, res) => {
  if (cache.cayenne !== null && cache.cayenne.length > 0) {
    return res.json({ success: true, data: cache['cayenne'] });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Cayenne Cache not ready yet" });
  }
});

contractsHandler.get("/serrano-contract-addresses", (req, res) => {
  if (cache.serrano !== null && cache.serrano.length > 0) {
    return res.json({ success: true, data: cache['serrano'] });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Serrano Cache not ready yet" });
  }
});

contractsHandler.get("/internal-dev-contract-addresses", (req, res) => {
  if (cache.internalDev !== null && cache.internalDev.data.length > 0) {
    return res.json({
      success: true,
      config: cache['internalDev']['config'],
      data: cache['internalDev'].data,
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "internalDev Cache not ready yet" });
  }
});

// Update cache immediately when the server starts
updateCache('cayenne');
updateCache('serrano');
updateCache('internalDev');

// Update cache every 5 minutes
setInterval(() => {
  updateCache('cayenne');
}, 5 * 60 * 1000);

setInterval(() => {
  updateCache('internalDev');
}, 5 * 60 * 1000);

setInterval(() => {
  updateCache('serrano');
}, 5 * 60 * 1000);

export async function getLitContractABIs() {

  const contractsData = [];

  console.log(`Getting directory...`);

  const filesRes = await fetch(createPath('rust/lit-core/lit-blockchain/abis'), HEADER);

  const files = await filesRes.json();
  console.log("files length:", files.length)

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

async function updateCache(network: 'cayenne' | 'serrano' | 'internalDev') {

  let API: string;
  let filePath: string;
  let lastModified: string;

  switch (network) {
    case 'cayenne':
      filePath = extractPathAfterMain(CAYENNE_CONTRACTS_JSON);
      API = CAYENNE_CONTRACTS_JSON;
      lastModified = await getLastModified(filePath);
      break;
    case 'serrano':
      API = SERRANO_CONTRACTS_JSON;
      lastModified = "2023-04-26T23:00:00.000Z";
      break;
    case 'internalDev':
      API = INTERNAL_CONTRACTS_JSON;
      filePath = extractPathAfterMain(INTERNAL_CONTRACTS_JSON);
      lastModified = await getLastModified(filePath);
      break;
  }


  let cayenneDiamondData = null;

  if (network === 'cayenne' || network === 'internalDev') {
    cayenneDiamondData = await getLitContractABIs();
    console.log("✅ Got cayenneDiamondData");
  }

  const res = await fetch(API);

  const resData = await res.json();

  const data = [];

  if (network === 'internalDev') {
    cache[network]['config'] = {
      chainId: resData?.chainId ?? null,
      rpcUrl: resData?.rpcUrl ?? null,
      chainName: resData?.chainName ?? null,
      litNodeDomainName: resData?.litNodeDomainName ?? null,
      litNodePort: resData?.litNodePort ?? null,
      rocketPort: resData?.rocketPort ?? null,
    };
  }

  for (const [name, address] of Object.entries(resData)) {

    const contractFileName = mapper[name];

    if (contractFileName) {

      if (network === 'cayenne' || network === 'internalDev') {
        const ABI = cayenneDiamondData.find((item) => item.name === contractFileName);

        if (!ABI) {
          console.log(`❗️❗️ contractFileName: ${contractFileName} not found in cayenneDiamondData`);
        }
        if (!Object.values(mapper).includes(contractFileName)) {
          continue;
        }

        data.push({
          name: contractFileName,
          contracts: [
            {
              network: network,
              address_hash: address,
              inserted_at: lastModified,
              ABI: ABI?.data ?? [],
            },
          ],
        })
      } else if (network === 'serrano') {
        const item = {
          name: mapper[name],
          contracts: [
            {
              network: 'serrano',
              address_hash: address,
              inserted_at: lastModified,
              ABIUrl: `${ABI_API}${address}`,
            },
          ]
        }

        data.push(item);
      } else {
        console.error('Unknown network:', network);
      }


    } else {
      console.log(`\x1b[33m%s\x1b[0m`, `❗️ "${name}" is not mapped`);
    }
  }
  if (network === 'internalDev') {
    cache[network]['data'] = data;
  } else {
    cache[network] = data;
  }

  console.log(`✅ Cache Updated for "${network}"`);
}

export { contractsHandler };
