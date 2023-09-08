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

let cache: any = null;
let lastUpdated: Date | null = null;

// -- config

// https://github.com/LIT-Protocol/lit-assets/tree/develop/blockchain/contracts/contracts/lit-node
const contracts = [
  "AccessControlConditions",
  "Allowlist",
  "ConditionValidations",
  "HDKeyDeriver",
  "LITToken",
  "Multisender",
  "PKPHelper",
  "PKPNFT",
  "PKPNFTMetadata",
  "PKPPermissions",
  "PubkeyRouter",
  "RateLimitNFT",
  "Staking",
  "StakingBalances",
  "WLIT",
];

const CONTRACT_API = `https://chain.litprotocol.com/token-autocomplete?q=`;
const LOOKUP_API = `https://chain.litprotocol.com/api?module=account&action=txlist&address=`;
const ABI_API = `https://chain.litprotocol.com/api?module=contract&action=getabi&address=`;

const DEPLOYER_ADDRESSES = [
  "0x046bf7bb88e0e0941358ce3f5a765c9acdda7b9c",
  "0xa54b67b7d202f0516c340e18169882ec9b6f88d8",
  "0xe964c013414d2d2c34c9bd319a52cf334e8bddb7",
  "0xD875480fdE946c74ecaF71bb643cbe9F2E68E5a8",

  // If user provide it in process.env, then combine it with the default ones
  ...(process.env.DEPLOYER_ADDRESSES || "").split(","),
];

aggregator.get("/contract-addresses", (req, res) => {
  if (cache) {
    return res.json({ success: true, data: cache });
  } else {
    return res
      .status(500)
      .json({ success: false, message: "Cache not ready yet" });
  }
});

aggregator.get("/serrano-contract-addresses", (req, res) => {
  return res.json({
    success: true,
    data: [
      {
        name: "AccessControlConditions",
        contracts: [
          {
            address_hash: "0x8b353Bb9E26F2c2B8155f377982537C39AD01A1B",
            inserted_at: "2023-04-27T00:00:00.000000Z",
          },
        ],
      },
      {
        name: "PKPNFT",
        contracts: [
          {
            address_hash: "0x8F75a53F65e31DD0D2e40d0827becAaE2299D111",
            inserted_at: "2023-04-27T00:00:00.000000Z",
          },
        ],
      },
      {
        name: "PKPHelper",
        contracts: [
          {
            address_hash: "0x8bB62077437D918891F12c7F35d9e1B78468bF11",
            inserted_at: "2023-04-27T00:00:00.000000Z",
          },
        ],
      },
      {
        name: "PKPPermissions",
        contracts: [
          {
            address_hash: "0x4Aed2F242E806c58758677059340e29E6B5b7619",
            inserted_at: "2023-04-27T00:00:00.000000Z",
          },
        ],
      },
    ],
  });
});

// Update cache immediately when the server starts
updateCache();

// Update cache every 5 minutes
setInterval(updateCache, 5 * 60 * 1000);

async function updateCache() {
  const now = new Date();

  let aggregatedResults = [];

  for (const contract of contracts) {
    const res = await fetch(`${CONTRACT_API}${contract}`);

    let deployedContracts: ContractInfo[] = await res.json();

    // only show the 3 latest deployed contracts
    deployedContracts = deployedContracts.slice(0, 2);

    let skip = false;

    for (const [i, info] of deployedContracts.entries()) {
      if (info.type !== "contract") {
        continue;
      }

      console.log(`Getting info for ${contract} ${info.address_hash}`);

      // Check if contract was deployed by a deployer address
      const lookupRes = await fetch(`${LOOKUP_API}${info.address_hash}`);
      const lookupData = await lookupRes.json();

      const creatorTx = lookupData.result.find(
        (item: any) =>
          item.contractAddress.toLowerCase() === info.address_hash.toLowerCase()
      );

      if (creatorTx && DEPLOYER_ADDRESSES.includes(creatorTx.from)) {
        deployedContracts[i].ABIUrl = `${ABI_API}${info.address_hash}`;
        deployedContracts[i].creator = creatorTx.from;
        deployedContracts[i].tx_hash = creatorTx.hash;
      } else {
        skip = true;
      }
    }

    if (!skip) {
      // aggregatedResults[contract] = deployedContracts;
      if (deployedContracts.length > 0) {
        aggregatedResults.push({
          name: contract,
          contracts: deployedContracts,
        });
      }
    }
  }

  // Update cache and lastUpdated timestamp
  cache = aggregatedResults;
  lastUpdated = now;

  console.log("✅ Cache Updated!");
}

export { aggregator };
