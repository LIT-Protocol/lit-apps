import express from "express";
import bodyParser from "body-parser";
// import * as dotenv from "dotenv";
// dotenv.config();
//
// https://github.com/LIT-Protocol/lit-assets/tree/develop/rust/lit-core/lit-blockchain/abis

type LitNetwork = 'cayenne' | 'serrano' | 'internalDev' | 'manzano' | 'habanero';

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

async function getLastModified(filePath: string, network: string) {

  // lit-general-worker:dev: Lit General Worker 3031
  console.log("filePath:", filePath);

  const fileAPI = `https://api.github.com/repos/${USERNAME}/networks/commits?path=${filePath}`;

  // console.log("fileAPI:", fileAPI);

  try {
    const response = await fetch(fileAPI, HEADER);
    const commits = await response.json();

    // If there are commits, return the date of the most recent one.
    if (commits.length > 0) {
      return commits[0].commit.author.date;
    }
    console.error(`[${network}] No commits found for ${filePath}`);
    return null;
  } catch (error) {
    console.error(`[${network}] Error fetching last modified date: ${error.toString()}`);
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
  manzano: {
    config: null,
    data: null,
  },
  habanero: {
    config: null,
    data: null
  }
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
  // hdKeyDeriverContractAddress: "HDKeyDeriver",
};

const ABI_API = `https://chain.litprotocol.com/api?module=contract&action=getabi&address=`;

const CAYENNE_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/cayenne/deployed-lit-node-contracts-temp.json';
const SERRANO_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/serrano/deployed-lit-node-contracts-temp.json';
const INTERNAL_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/internal-dev/deployed-lit-node-contracts-temp.json';
const MANZANO_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/manzano/deployed-lit-node-contracts-temp.json';
const HABANERO_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/habanero/deployed-lit-node-contracts-temp.json';

function handleResponse(networkName: string) {
  return (req: any, res: any) => {
    if (cache[networkName] !== null && cache[networkName]?.data?.length > 0) {
      return res.json({
        success: true,
        config: cache[networkName]['config'],
        data: cache[networkName].data,
      });
    }
    // serrano & cayenne don't have .data property
    if (cache[networkName] !== null && cache[networkName]?.length > 0) {
      return res.json({
        success: true,
        config: null,
        data: cache[networkName],
      });
    } else {
      return res
        .status(500)
        .json({ success: false, message: `${networkName} Cache not ready yet` });
    }
  };
}

// ========== API list =========
const BASE = process.env.ENV === 'dev' ? 'http://localhost:3031' : process.env.DOMAIN ?? 'https://lit-general-worker.getlit.dev';

contractsHandler.get("/apis", (req, res) => {
  res.json({
    env: {
      ENV: process.env.ENV,
      DOMAIN: process.env.DOMAIN ?? 'not set',
    },
    addresses: `${BASE}/network/addresses`,
    habanero: {
      type: 'decentralised mainnet',
      contracts: `${BASE}/habanero/contracts`,
    },
    manzano: {
      type: 'decentralised testnet',
      contracts: `${BASE}/manzano/contracts`,
    },
    cayenne: {
      type: 'testnet',
      contracts: `${BASE}/cayenne/contracts`,
    },
    serrano: {
      type: 'testnet',
      contracts: `${BASE}/serrano/contracts`,
    },
    internalDev: {
      type: 'local',
      contracts: `${BASE}/internal-dev/contracts`,
    },
  });
});

// ========== Cayenne ==========
// TODO: TO BE DEPRECATED
contractsHandler.get("/contract-addresses", handleResponse("cayenne"));
// TODO: TO BE DEPRECATED
contractsHandler.get("/cayenne-contract-addresses", handleResponse("cayenne"));
contractsHandler.get("/cayenne/contracts", handleResponse("cayenne"));

// ========== Serrano ==========
// TODO: TO BE DEPRECATED
contractsHandler.get("/serrano-contract-addresses", handleResponse("serrano"));
contractsHandler.get("/serrano/contracts", handleResponse("serrano"));

// ========== Internal Dev ==========
// TODO: TO BE DEPRECATED
contractsHandler.get("/internal-dev-contract-addresses", handleResponse("internalDev"));
contractsHandler.get("/internal-dev/contracts", handleResponse("internalDev"));


// ========== Manzano ==========
// TODO: TO BE DEPRECATED
contractsHandler.get("/manzano-contract-addresses", handleResponse("manzano"));
contractsHandler.get("/manzano/contracts", handleResponse("manzano"));

// ========== Habanero ==========
// TODO: TO BE DEPRECATED
contractsHandler.get("/habanero-contract-addresses", handleResponse("habanero"));
contractsHandler.get("/habanero/contracts", handleResponse("habanero"));

// ========== All Networks ==========
contractsHandler.get("/network/addresses", (req, res) => {
  if (cache.manzano !== null && cache.manzano.data.length > 0) {

    function getData(network: LitNetwork) {
      try {

        // manzano & habanero has .data property
        const data = cache[network].data ?? cache[network];

        return data.map((item: { name: string, contracts: any[] }) => {
          return {
            name: item.name,
            address: item.contracts[0].address_hash,
          };
        });

      } catch (e) {
        console.log(e);
        console.log(`❌ Failed to get cache from network ${network}`);
      }
    }

    return res.json({
      manzano: getData('manzano'),
      habanero: getData('habanero'),
      cayenne: getData('cayenne'),
      serrano: getData('serrano'),
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "cache not ready yet" });
  }
});

const litNetworks = ['cayenne', 'serrano', 'internalDev', 'manzano', 'habanero'];

// Initial update for all items, and pdate cache immediately when the server starts
litNetworks.forEach((pepper: LitNetwork) => updateCache(pepper));

// Update cache every 5 minutes for each item
litNetworks.forEach((pepper: LitNetwork) => {
  setInterval(() => {
    updateCache(pepper);
  }, 5 * 60 * 1000);
});

export async function getLitContractABIs(network: string) {

  const contractsData = [];

  const path = createPath('rust/lit-core/lit-blockchain/abis');
  // console.log(`[${network}] Getting files from "${path}"`);
  console.log("path:", path);

  const filesRes = await fetch(path, HEADER);

  const files = await filesRes.json();

  if (files.length <= 0) {
    console.log(`[${network}] files length: ${files.length}`);
  }

  for (const file of files) {

    const name = file.name.replace('.json', '');

    if (!Object.values(mapper).includes(name)) {
      continue;
    }

    console.log(`[${network}] Getting file ${file.download_url}`);

    const fileRes = await fetch(file.download_url, HEADER);

    const fileData = await fileRes.json();

    contractsData.push({
      name: file.name.replace('.json', ''),
      contractName: fileData.contractName,
      data: fileData.abi,
    });
  }

  if (!contractsData.length) {
    throw new Error(`[${network}] No data`);
  }

  return contractsData;
}


async function updateCache(network: LitNetwork) {

  let API: string;
  let filePath: string;
  let lastModified: string;

  switch (network) {
    case 'cayenne':
      filePath = extractPathAfterMain(CAYENNE_CONTRACTS_JSON);
      API = CAYENNE_CONTRACTS_JSON;
      lastModified = await getLastModified(filePath, network);
      break;
    case 'serrano':
      API = SERRANO_CONTRACTS_JSON;
      lastModified = "2023-04-26T23:00:00.000Z";
      break;
    case 'internalDev':
      API = INTERNAL_CONTRACTS_JSON;
      filePath = extractPathAfterMain(INTERNAL_CONTRACTS_JSON);
      lastModified = await getLastModified(filePath, network);
      break;
    case 'manzano':
      filePath = extractPathAfterMain(MANZANO_CONTRACTS_JSON);
      API = MANZANO_CONTRACTS_JSON;
      lastModified = await getLastModified(filePath, network);
      break;
    case 'habanero':
      filePath = extractPathAfterMain(HABANERO_CONTRACTS_JSON);
      API = HABANERO_CONTRACTS_JSON;
      lastModified = await getLastModified(filePath, network);
      break;
  }


  let diamonData: any;

  if (network !== 'serrano') {
    console.log(`[${network}] Trying to get lit contract ABIs`);

    try {
      diamonData = await getLitContractABIs(network);
      console.log(`✅ [${network}] Got diamonData`);
    } catch (e: any) {
      console.log(`❌ [${network}] Error getting lit contract ABIs => ${e.toString()}`);
    }

  }

  const res = await fetch(API);

  const resData = await res.json();

  const data = [];

  if (network !== 'cayenne' && network !== 'serrano') {
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

      if (network !== 'serrano') {

        if (!diamonData) {
          console.error(`❗️❗️ [${network}] diamonData is ${diamonData}`);
        }

        const ABI = diamonData.find((item: { name: string }) => item.name === contractFileName);

        if (!ABI) {
          console.log(`❗️❗️ contractFileName: ${contractFileName} not found in diamonData`);
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
  if (network !== 'serrano' && network !== 'cayenne') {
    cache[network]['data'] = data;
  } else {
    cache[network] = data;
  }

  console.log(`✅ [${network}] Cache Updated`);
}

export { contractsHandler };
