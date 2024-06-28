// TODO: Remove Serrano network support after the Serrano network is deprecated

import express from "express";
import bodyParser from "body-parser";
import { LitContracts } from "@lit-protocol/contracts-sdk";
// https://github.com/LIT-Protocol/lit-assets/tree/develop/rust/lit-core/lit-blockchain/abis
import { PKPNFTFacetABI } from "./datil-dev/PKPNFTFacetABI";
import { PKPPermissionsFacetABI } from "./datil-dev/PKPPermissionsFacetABI";
import { PKPHelperABI } from "./datil-dev/PKPHelperAbi";
import { StakingABI } from "./datil-dev/StakingAbi";
import { RateLimitNftAbi } from "./datil-dev/RateLimitNFTAbi";

type LitNetwork =
  | "cayenne"
  | "serrano"
  | "internalDev"
  | "manzano"
  | "habanero"
  | "datil-dev";

const ABI_API = `https://chain.litprotocol.com/api?module=contract&action=getabi&address=`;
const CAYENNE_CONTRACTS_JSON =
  process.env.CAYENNE_CONTRACTS_JSON ??
  "https://raw.githubusercontent.com/LIT-Protocol/networks/main/cayenne/deployed-lit-node-contracts-temp.json";
const SERRANO_CONTRACTS_JSON =
  process.env.SERRANO_CONTRACTS_JSON ??
  "https://raw.githubusercontent.com/LIT-Protocol/networks/main/serrano/deployed-lit-node-contracts-temp.json";
const INTERNAL_CONTRACTS_JSON =
  process.env.INTERNAL_CONTRACTS_JSON ??
  "https://raw.githubusercontent.com/LIT-Protocol/networks/main/internal-dev/deployed-lit-node-contracts-temp.json";
const MANZANO_CONTRACTS_JSON =
  process.env.MANZANO_CONTRACTS_JSON ??
  "https://raw.githubusercontent.com/LIT-Protocol/networks/main/manzano/deployed-lit-node-contracts-temp.json";
const HABANERO_CONTRACTS_JSON =
  process.env.HABANERO_CONTRACTS_JSON ??
  "https://raw.githubusercontent.com/LIT-Protocol/networks/main/habanero/deployed-lit-node-contracts-temp.json";

const DATILDEV_CONTRACTS_JSON =
  process.env.DATILDEV_CONTRACTS_JSON ??
  "https://raw.githubusercontent.com/LIT-Protocol/networks/main/datil-dev/deployed-lit-node-contracts-temp.json";

// -- config
const TOKEN = process.env.GITHUB_LIT_ASSETS_REAL_ONLY_API;
const USERNAME = "LIT-Protocol";
const REPO_NAME = "lit-assets";

const createPath = (PATH: string) => {
  return `https://api.github.com/repos/${USERNAME}/${REPO_NAME}/contents/${PATH}`;
};

function extractPathAfterMain(urlString: string): string {
  const url = new URL(urlString);
  const pathname = url.pathname;
  const parts = pathname.split("/");
  const mainIndex = parts.indexOf("main");
  const desiredPath = parts.slice(mainIndex + 1).join("/");
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
    console.error(
      `[${network}] Error fetching last modified date: ${error.toString()}`
    );
  }
}

const HEADER = {
  headers: {
    Authorization: `token ${TOKEN}`,
    Accept: "application/vnd.github.v3+json",
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
    data: null,
  },
  ["datil-dev"]: {
    config: null,
    data: null,
  },
};

let statsCache = {
  manzano: {
    totalPkps: "not ready yet" as number | string,
    totalCcs: "not ready yet" as number | string,
  },
  habanero: {
    totalPkps: "not ready yet" as number | string,
    totalCcs: "not ready yet" as number | string,
  },
  cayenne: {
    totalPkps: "not ready yet" as number | string,
    totalCcs: "not ready yet" as number | string,
  },
  ['datil-dev']: {
    totalPkps: "not ready yet" as number | string,
    totalCcs: "not ready yet" as number | string,
  },
};

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

function handleContractsResponse(networkName: LitNetwork) {
  return (req: any, res: any) => {
    if (cache[networkName] !== null && cache[networkName]?.data?.length > 0) {
      return res.json({
        success: true,
        config: cache[networkName]["config"],
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
      return res.status(500).json({
        success: false,
        message: `${networkName} Cache not ready yet`,
      });
    }
  };
}

function handleAddressesResponse(networkName: LitNetwork) {
  function getData(network: LitNetwork) {
    try {
      // manzano & habanero has .data property
      const data = cache[network].data ?? cache[network];

      return data.map((item: { name: string; contracts: any[] }) => {
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

  return (req: any, res: any) => {
    return res.json({
      addresses: getData(networkName),
    });
  };
}

function handleStatsResponse(networkName: LitNetwork) {
  function getData(network: LitNetwork) {
    try {
      return statsCache[network];
    } catch (e) {
      console.log(e);
      console.log(`❌ Failed to get stats cache from network ${network}`);
    }
  }

  return (req: any, res: any) => {
    return res.json({
      stats: getData(networkName),
    });
  };
}

// Function to get the appropriate handler function by name
function getHandlerFunction(handlerName: string, networkName: LitNetwork) {
  const handlers = {
    handleContractsResponse: handleContractsResponse(networkName),
    handleAddressesResponse: handleAddressesResponse(networkName),
    handleStatsResponse: handleStatsResponse(networkName),
    // Add more handler functions here as needed
  };
  return handlers[handlerName];
}

// ========== API list =========
const HOST =
  process.env.ENV === "dev"
    ? "http://localhost:3031"
    : process.env.HOST ?? "https://apis.getlit.dev";

contractsHandler.get("/", (req, res) => {
  res.json({
    env: {
      HOST: process.env.HOST ?? "https://apis.getlit.dev",
      FAUCET_LINK:
        process.env.FAUCET_LINK ?? "https://chronicle-faucet-app.vercel.app/",
      CHAIN_EXPLORER:
        process.env.CHAIN_EXPLORER ?? "https://chain.litprotocol.com/",
      CHAIN_ID: process.env.CHAIN_ID ?? "175177",
      CHAIN_NAME: process.env.CHAIN_NAME ?? "lit",
      RPC_URL:
        process.env.RPC_URL ?? "https://lit-protocol.calderachain.xyz/http",
      source: {
        HABANERO_CONTRACTS_JSON,
        MANZANO_CONTRACTS_JSON,
        CAYENNE_CONTRACTS_JSON,
        SERRANO_CONTRACTS_JSON,
        INTERNAL_CONTRACTS_JSON,

        // Added on 26 June 2024
        DATILDEV_CONTRACTS_JSON,
      },
    },
    network: {
      addresses: `${HOST}/network/addresses`,
      ["datil-dev"]: {
        decentralized: true,
        type: "devnet",
        contracts: `${HOST}/datil-dev/contracts`,
        addresses: `${HOST}/datil-dev/addresses`,
        stats: `${HOST}/datil-dev/stats`,
      },
      habanero: {
        decentralized: true,
        type: "mainnet",
        contracts: `${HOST}/habanero/contracts`,
        addresses: `${HOST}/habanero/addresses`,
        stats: `${HOST}/habanero/stats`,
      },
      manzano: {
        decentralized: true,
        type: "testnet",
        contracts: `${HOST}/manzano/contracts`,
        addresses: `${HOST}/manzano/addresses`,
        stats: `${HOST}/manzano/stats`,
      },
      cayenne: {
        decentralized: false,
        type: "testnet",
        contracts: `${HOST}/cayenne/contracts`,
        addresses: `${HOST}/cayenne/addresses`,
        stats: `${HOST}/cayenne/stats`,
      },
      serrano: {
        decentralized: false,
        type: "testnet",
        contracts: `${HOST}/serrano/contracts`,
        addresses: `${HOST}/serrano/addresses`,
      },
      internalDev: {
        decentralized: false,
        type: "devnet",
        contracts: `${HOST}/internal-dev/contracts`,
        addresses: `${HOST}/internal-dev/addresses`,
      },
    },
  });
});

const networks = [
  {
    name: "cayenne",
    endpoints: [
      { path: "/cayenne/contracts", handler: "handleContractsResponse" },
      { path: "/cayenne/addresses", handler: "handleAddressesResponse" },
      { path: "/cayenne/stats", handler: "handleStatsResponse" },

      // @deprecated
      {
        path: "/cayenne-contrat-addresses",
        handler: "handleContractsResponse",
      },
      { path: "/contract-addresses", handler: "handleContractsResponse" },
    ],
  },
  {
    name: "serrano",
    endpoints: [
      { path: "/serrano/contracts", handler: "handleContractsResponse" },
      { path: "/serrano/addresses", handler: "handleAddressesResponse" },

      // @deprecated
      {
        path: "/serrano-contract-addresses",
        handler: "handleContractsResponse",
      },
    ],
  },
  {
    name: "internalDev",
    endpoints: [
      { path: "/internal-dev/contracts", handler: "handleContractsResponse" },
      { path: "/internal-dev/addresses", handler: "handleAddressesResponse" },

      // @deprecated
      {
        path: "/internal-dev-contract-addresses",
        handler: "handleContractsResponse",
      },
    ],
  },
  {
    name: "manzano",
    endpoints: [
      { path: "/manzano/contracts", handler: "handleContractsResponse" },
      { path: "/manzano/addresses", handler: "handleAddressesResponse" },
      { path: "/manzano/stats", handler: "handleStatsResponse" },

      // @deprecated
      {
        path: "/manzano-contract-addresses",
        handler: "handleContractsResponse",
      },
    ],
  },
  {
    name: "habanero",
    endpoints: [
      { path: "/habanero/contracts", handler: "handleContractsResponse" },
      { path: "/habanero/addresses", handler: "handleAddressesResponse" },
      { path: "/habanero/stats", handler: "handleStatsResponse" },

      // @deprecated
      {
        path: "/habanero-contract-addresses",
        handler: "handleContractsResponse",
      },
    ],
  },
  {
    name: "datil-dev",
    endpoints: [
      { path: "/datil-dev/contracts", handler: "handleContractsResponse" },
      { path: "/datil-dev/addresses", handler: "handleAddressesResponse" },
      { path: "/datil-dev/stats", handler: "handleStatsResponse" },

      // @deprecated
      {
        path: "/datil-dev-contract-addresses",
        handler: "handleContractsResponse",
      },
    ],
  },
];

// ========== Loop through each network and register endpoint ==========
networks.forEach(
  ({
    name,
    endpoints,
  }: {
    name: LitNetwork;
    endpoints: { path: string; handler: string }[];
  }) => {
    // Register current endpoints with their specific handlers
    endpoints.forEach(({ path, handler }) => {
      const handlerFunction = getHandlerFunction(handler, name);
      contractsHandler.get(path, handlerFunction);
    });
  }
);

// ========== All Networks ==========
contractsHandler.get("/network/addresses", (req, res) => {
  if (cache.manzano !== null && cache.manzano.data.length > 0) {
    function getData(network: LitNetwork) {
      try {
        // manzano & habanero has .data property
        const data = cache[network].data ?? cache[network];

        return data.map((item: { name: string; contracts: any[] }) => {
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
      manzano: getData("manzano"),
      habanero: getData("habanero"),
      ["datil-dev"]: getData("datil-dev"),
      cayenne: getData("cayenne"),
      serrano: getData("serrano"),
    });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "cache not ready yet" });
  }
});

const litNetworks = [
  "cayenne",
  "serrano",
  "internalDev",
  "manzano",
  "habanero",
  "datil-dev",
];

// Initial update for all items, and update cache immediately when the server starts
litNetworks.forEach(async (pepper: LitNetwork) => {
  await updateContractsCache(pepper);
  await updateStatsCache(pepper);
});

// Update cache every 5 minutes for each item
litNetworks.forEach(async (pepper: LitNetwork) => {
  setInterval(
    async () => {
      await updateContractsCache(pepper);
      await updateStatsCache(pepper);
    },
    5 * 60 * 1000
  );
});

export async function getLitContractABIs(network: LitNetwork) {
  const contractsData = [];

  const path = createPath("rust/lit-core/lit-blockchain/abis");
  // console.log(`[${network}] Getting files from "${path}"`);
  console.log("path:", path);

  const filesRes = await fetch(path, HEADER);

  const files = await filesRes.json();

  if (files.length <= 0) {
    console.log(`[${network}] files length: ${files.length}`);
  }

  for (const file of files) {
    const name = file.name.replace(".json", "");

    if (!Object.values(mapper).includes(name)) {
      continue;
    }

    console.log(`[${network}] Getting file ${file.download_url}`);

    const fileRes = await fetch(file.download_url, HEADER);

    const fileData = await fileRes.json();

    contractsData.push({
      name: file.name.replace(".json", ""),
      contractName: fileData.contractName,
      data: fileData.abi,
    });
  }

  if (!contractsData.length) {
    console.log(`[${network}] No data`);
  }

  return contractsData;
}

async function updateStatsCache(network: LitNetwork) {
  // -- serrano is not supported
  if (network === "serrano" || network === "internalDev") {
    console.log(`❗️ [${network}] updateStatsCache is not supported`);
    return;
  }

  const contractClient = new LitContracts({
    network: network as "cayenne" | "habanero" | "manzano" | "datil-dev",
  });

  await contractClient.connect();

  // -- total pkps
  try {
    let totalPkps = (
      await contractClient!.pkpNftContract.read.totalSupply()
    ).toNumber();
    console.log(`[${network}] totalPkps:`, totalPkps);

    statsCache[network].totalPkps = totalPkps;
  } catch (e) {
    console.log(
      `[${network}] Contracts endpoint is not ready yet. Self-referential error occurred`
    );
  }

  // -- total ccs
  try {
    let totalCcs = (
      await contractClient!.rateLimitNftContract.read.totalSupply()
    ).toNumber();
    console.log(`[${network}] totalCcs:`, totalCcs);

    statsCache[network].totalCcs = totalCcs;
  } catch (e) {
    console.log(
      `[${network}] Contracts endpoint is not ready yet. Self-referential error occurred`
    );
  }
}

async function updateContractsCache(network: LitNetwork) {
  let API: string;
  let filePath: string;
  let lastModified: string;

  switch (network) {
    case "cayenne":
      filePath = extractPathAfterMain(CAYENNE_CONTRACTS_JSON);
      API = CAYENNE_CONTRACTS_JSON;
      lastModified = await getLastModified(filePath, network);
      break;
    case "serrano":
      API = SERRANO_CONTRACTS_JSON;
      lastModified = "2023-04-26T23:00:00.000Z";
      break;
    case "internalDev":
      API = INTERNAL_CONTRACTS_JSON;
      filePath = extractPathAfterMain(INTERNAL_CONTRACTS_JSON);
      lastModified = await getLastModified(filePath, network);
      break;
    case "manzano":
      filePath = extractPathAfterMain(MANZANO_CONTRACTS_JSON);
      API = MANZANO_CONTRACTS_JSON;
      lastModified = await getLastModified(filePath, network);
      break;
    case "habanero":
      filePath = extractPathAfterMain(HABANERO_CONTRACTS_JSON);
      API = HABANERO_CONTRACTS_JSON;
      lastModified = await getLastModified(filePath, network);
      break;
    case "datil-dev":
      filePath = extractPathAfterMain(DATILDEV_CONTRACTS_JSON);
      API = DATILDEV_CONTRACTS_JSON;
      lastModified = await getLastModified(filePath, network);
      break;
  }

  let diamonData: any;

  if (network !== "serrano") {
    console.log(`[${network}] Trying to get lit contract ABIs`);

    try {
      diamonData = await getLitContractABIs(network);
      console.log(`✅ [${network}] Got diamonData`);
    } catch (e: any) {
      console.log(
        `❌ [${network}] Error getting lit contract ABIs => ${e.toString()}`
      );
    }
  }

  let res: any;

  try {
    res = await fetch(API);
  } catch (e) {
    console.log(`❌ [${network}] Error fetching API => ${e.toString()}`);
  }

  let resData: any;

  try {
    resData = await res.json();
  } catch (e) {
    console.log(`❌ [${network}] Error parsing res.json() => ${e.toString()}`);
  }

  const data = [];

  if (network !== "cayenne" && network !== "serrano") {
    cache[network]["config"] = {
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
      if (network !== "serrano") {
        if (!diamonData) {
          console.error(`❗️❗️ [${network}] diamonData is ${diamonData}`);
        }

        let ABI: any;

        try {
          diamonData.find(
            (item: { name: string }) => item.name === contractFileName
          );
        } catch (e) {
          console.error(
            `❗️❗️ [${network}] Error finding contractFileName in diamonData => ${e.toString()}`
          );

          if (network === "datil-dev") {
            const supportedContracts = {
              PKPNFT: PKPNFTFacetABI,
              PKPPermissions: PKPPermissionsFacetABI,
              PKPHelper: PKPHelperABI,
              Staking: StakingABI,
              RateLimitNFT: RateLimitNftAbi,
            };

            if (contractFileName in supportedContracts) {
              console.log(
                `💭 [datil-dev] Using static ABI for "${contractFileName}" contract`
              );

              const abi = supportedContracts[contractFileName];
              ABI = { data: abi };
            } else {
              console.error(
                `❗️[datil-dev] contractFileName: ${contractFileName} not supported`
              );
            }
          }
        }

        if (!ABI) {
          console.log(
            `❗️❗️ contractFileName: ${contractFileName} not found in diamonData`
          );
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
        });
      } else if (network === "serrano") {
        const item = {
          name: mapper[name],
          contracts: [
            {
              network: "serrano",
              address_hash: address,
              inserted_at: lastModified,
              ABIUrl: `${ABI_API}${address}`,
            },
          ],
        };

        data.push(item);
      } else {
        console.error("Unknown network:", network);
      }
    } else {
      console.log(`\x1b[33m%s\x1b[0m`, `❗️ "${name}" is not mapped`);
    }
  }
  if (network !== "serrano" && network !== "cayenne") {
    cache[network]["data"] = data;
  } else {
    cache[network] = data;
  }

  console.log(`✅ [${network}] Cache Updated`);
}

export { contractsHandler };
