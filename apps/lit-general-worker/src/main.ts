import express, { Express } from "express";
import bodyParser from "body-parser";
import { txHandler } from "./handlers/txHandler";
import { analyticsHandler } from "./handlers/analyticsHandler";
import { contractsHandler } from "./handlers/contracts-handler/contractsHandler";
import cors from "cors";
import { CAYENNE_CONTRACTS_JSON, HABANERO_CONTRACTS_JSON, INTERNAL_CONTRACTS_JSON, MANZANO_CONTRACTS_JSON, SERRANO_CONTRACTS_JSON } from "./env";
import { litActionsHandler } from "./handlers/lit-actions-handler/litActionsHandler";


const app: Express = express();
app.use(bodyParser.json());

const blacklist = (process.env.CORS_BLACKLIST || "").split(",");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || blacklist.indexOf(origin) === -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

// ========== API list =========
const HOST = process.env.ENV === 'dev' ? 'http://localhost:3031' : process.env.HOST ?? 'https://apis.getlit.dev';
const mainHandler = express();
app.use(mainHandler);

mainHandler.get("/", (req, res) => {
  res.json({
    env: {
      HOST: process.env.HOST ?? 'https://apis.getlit.dev',
      FAUCET_LINK: process.env.FAUCET_LINK ?? 'https://chronicle-faucet-app.vercel.app/',
      CHAIN_EXPLORER: process.env.CHAIN_EXPLORER ?? 'https://chain.litprotocol.com/',
      CHAIN_ID: process.env.CHAIN_ID ?? '175177',
      CHAIN_NAME: process.env.CHAIN_NAME ?? 'lit',
      RPC_URL: process.env.RPC_URL ?? 'https://lit-protocol.calderachain.xyz/http',
      source: {
        HABANERO_CONTRACTS_JSON,
        MANZANO_CONTRACTS_JSON,
        CAYENNE_CONTRACTS_JSON,
        SERRANO_CONTRACTS_JSON,
        INTERNAL_CONTRACTS_JSON,
      },
    },
    network: {
      addresses: `${HOST}/network/addresses`,
      habanero: {
        decentralized: true,
        type: 'mainnet',
        contracts: `${HOST}/habanero/contracts`,
        addresses: `${HOST}/habanero/addresses`,
        stats: `${HOST}/habanero/stats`,
      },
      manzano: {
        decentralized: true,
        type: 'testnet',
        contracts: `${HOST}/manzano/contracts`,
        addresses: `${HOST}/manzano/addresses`,
        stats: `${HOST}/manzano/stats`,
      },
      cayenne: {
        decentralized: false,
        type: 'testnet',
        contracts: `${HOST}/cayenne/contracts`,
        addresses: `${HOST}/cayenne/addresses`,
        stats: `${HOST}/cayenne/stats`,
      },
      serrano: {
        decentralized: false,
        type: 'testnet',
        contracts: `${HOST}/serrano/contracts`,
        addresses: `${HOST}/serrano/addresses`,
      },
      internalDev: {
        decentralized: false,
        type: 'devnet',
        contracts: `${HOST}/internal-dev/contracts`,
        addresses: `${HOST}/internal-dev/addresses`,
      },
    },
    litActionExamples: `${HOST}/lit-action/examples`,
  });
});

app.use(contractsHandler);
app.use(litActionsHandler);
app.use(txHandler);
app.use(analyticsHandler);

const PORT: string | number = process.env.PORT || 3031;
app.listen(PORT, () => console.log("Lit General Worker " + PORT));
