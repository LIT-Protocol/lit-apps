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
const CACHE_DURATION = 10 * 60 * 1000;

aggregator.get("/contract-addresses", async (req, res) => {
  const now = new Date();

  // Check if cache exists and is not older than CACHE_DURATION
  if (
    cache &&
    lastUpdated &&
    now.getTime() - lastUpdated.getTime() < CACHE_DURATION
  ) {
    return res.json({ success: true, data: cache });
  }

  // https://github.com/LIT-Protocol/lit-assets/tree/develop/blockchain/contracts/contracts/lit-node
  const contracts = [
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

    // If user provide it in process.env, then combine it with the default ones
    ...(process.env.DEPLOYER_ADDRESSES || "").split(","),
  ];

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

  console.log("✅ Done!")

  res.json({ success: true, data: aggregatedResults });
});

export { aggregator };
