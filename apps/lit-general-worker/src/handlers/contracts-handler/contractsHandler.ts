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

const LOOKUP_API = `https://chain.litprotocol.com/api?module=account&action=txlist&address=`;
const ABI_API = `https://chain.litprotocol.com/api?module=contract&action=getabi&address=`;

const CAYENNE_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/cayenne/deployed-lit-node-contracts-temp.json';
const SERRANO_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/serrano/deployed-lit-node-contracts-temp.json';
const INTERNAL_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/internal-dev/deployed-lit-node-contracts-temp.json';
const MANZANO_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/manzano/deployed-lit-node-contracts-temp.json';
const HABANERO_CONTRACTS_JSON = 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/habanero/deployed-lit-node-contracts-temp.json';

// TODO: TO BE DEPRECATED, this is just an cayenne endpoint, but we want a more 
// specific naming convention for each network
// Removing this might break any apps that rely on this endpoint
contractsHandler.get("/contract-addresses", (req, res) => {
  if (cache.cayenne !== null && cache.cayenne.length > 0) {
    return res.json({ success: true, data: cache['cayenne'] });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Cayenne Cache not ready yet" });
  }
});

contractsHandler.get("/cayenne-contract-addresses", (req, res) => {
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

contractsHandler.get("/manzano-contract-addresses", (req, res) => {
  if (cache.manzano !== null && cache.manzano.data.length > 0) {
    return res.json({
      success: true,
      config: cache['manzano']['config'],
      data: cache['manzano'].data,
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "manzano Cache not ready yet" });
  }
});

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
      .json({ success: false, message: "manzano Cache not ready yet" });
  }
});

contractsHandler.get("/habanero-contract-addresses", (req, res) => {
  if (cache.habanero !== null && cache.habanero.data.length > 0) {
    return res.json({
      success: true,
      config: cache['habanero']['config'],
      data: cache['habanero'].data,
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "habanero Cache not ready yet" });
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
