// eg. { chainId: 1, decimals: 18, address: "0x...", symbol: "USDT", name: "Tether USD" }
export type SwapToken = {
  chainId: number;
  decimals: number;
  address: string;
  symbol: string;
  name: string;
};

// eg. { token: "USDT", balance: 100, value: 100 }
export type CurrentBalance = {
  token: SwapToken;
  balance: number;
  value: number;
};

// eg. { nonce: 0, gasPrice: BigNumber { _hex: "0x...", _isBigNumber: true }, gasLimit: BigNumber { _hex: "0x...", _isBigNumber: true }, to: "0x...", value: BigNumber { _hex: "0x...", _isBigNumber: true }, data: "0x...", chainId: 1, v: 0, r: "0x...", s: "0x...", from: "0x...", hash: "0x...", type: null, confirmations: 0, wait: [Function: wait] }
export type TX = {
  nonce: string;
  gasPrice: Number;
  gasLimit: Number;
  to: string;
  value: Number;
  data: string;
  chainId: number;
  v: number;
  r: string;
  s: string;
  from: string;
  hash: string;
  type: null;
  confirmations: number;
  wait: Function;
};

// eg. { status: 200, data: 1234.56 }
export type Response = {
  status: number;
  data: any;
};

// eg. { token: "USDT", percentage: 0.5 }
export type Strategy = Array<{ token: string; percentage: number }>;

// eg. { tokenToSell: "USDT", percentageToSell: 0.5, amountToSell: 500, tokenToBuy: "USDC", proposedAllocation: [{ token: "USDT", percentage: 0.5 }, { token: "USDC", percentage: 0.5 }], valueDiff: { token: "USDT", percentage: 0.5 } }
export type StrategyExecutionPlan = {
  tokenToSell: SwapToken;
  percentageToSell: number;
  amountToSell: number;
  tokenToBuy: SwapToken;
  proposedAllocation: Strategy;
  valueDiff: {
    token: string; // token symbol
    percentage: number;
  };
};

// eg. { maxGasPrice: 100, unit: "gwei", minExceedPercentage: 0.1, unless: { spikePercentage: 0.5, adjustGasPrice: 50 }
export type RebalanceConditions = {
  maxGasPrice: number;
  unit: string;
  minExceedPercentage: number;
  unless: {
    spikePercentage: number;
    adjustGasPrice: number;
  };
};

export type TokenInfo = {
  tokenId: string;
  publicKey: string;
  publicKeyBuffer: Buffer;
  ethAddress: string;
  btcAddress: string;
  isNewPKP: boolean;
};

// ----------------------------------------------
//          Job/Queue Management Types
// ----------------------------------------------
export type JobData = {
  ownerAddress: string;
  pkpInfo: TokenInfo;
  eventType: string;
  ipfsId: string;
  jsParams: string;
  eventParams: BlockEventParams;
};

export type BaseEventParams = {};

export interface BlockEventParams extends BaseEventParams {
  startBlock: number;
  endBlock: number;
}

export type SelectionItem = {
  id: string;
  name: string;
  enabled: boolean;
};

export type MergedJob = Partial<JobData> & {
  jobIds: Array<string>;
  name: string;
};
