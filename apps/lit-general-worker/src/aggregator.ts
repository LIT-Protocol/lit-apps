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
  const ABI_API = `https://chain.litprotocol.com/api?module=contract&action=getabi&address=`;

  let aggregatedResults = [];

  for (const contract of contracts) {
    const res = await fetch(`${CONTRACT_API}${contract}`);

    const deployedContracts: ContractInfo[] = await res.json();

    for (const [i, info] of deployedContracts.entries()) {
      deployedContracts[i].ABIUrl = `${ABI_API}${info.address_hash}`;
    }

    // aggregatedResults[contract] = deployedContracts;
    if (deployedContracts.length > 0) {
      aggregatedResults.push({
        name: contract,
        contracts: deployedContracts,
      });
    }
  }

  // Update cache and lastUpdated timestamp
  cache = aggregatedResults;
  lastUpdated = now;

  res.json({ success: true, data: aggregatedResults });
});

export { aggregator };
