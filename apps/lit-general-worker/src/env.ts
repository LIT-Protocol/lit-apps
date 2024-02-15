export type LitNetwork = 'cayenne' | 'serrano' | 'internalDev' | 'manzano' | 'habanero';

// https://github.com/LIT-Protocol/lit-assets/tree/develop/rust/lit-core/lit-blockchain/abis
export const ABI_API = `https://chain.litprotocol.com/api?module=contract&action=getabi&address=`;

export const CAYENNE_CONTRACTS_JSON = process.env.CAYENNE_CONTRACTS_JSON ?? 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/cayenne/deployed-lit-node-contracts-temp.json';
export const SERRANO_CONTRACTS_JSON = process.env.SERRANO_CONTRACTS_JSON ?? 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/serrano/deployed-lit-node-contracts-temp.json';
export const INTERNAL_CONTRACTS_JSON = process.env.INTERNAL_CONTRACTS_JSON ?? 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/internal-dev/deployed-lit-node-contracts-temp.json';
export const MANZANO_CONTRACTS_JSON = process.env.MANZANO_CONTRACTS_JSON ?? 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/manzano/deployed-lit-node-contracts-temp.json';
export const HABANERO_CONTRACTS_JSON = process.env.HABANERO_CONTRACTS_JSON ?? 'https://raw.githubusercontent.com/LIT-Protocol/networks/main/habanero/deployed-lit-node-contracts-temp.json';

export const GITHUB_LIT_ASSETS_TOKEN = process.env.GITHUB_LIT_ASSETS_REAL_ONLY_API;
export const GITHUB_LIT_ACTION_EXAMPLES_REPO_TOKEN = process.env.GITHUB_LIT_ACTION_EXAMPLES_REPO_TOKEN;
export const GITHUB_USERNAME = 'LIT-Protocol'
export const LIT_ASSETS_REPO = 'lit-assets';

// -- lit action examples
export const LIT_ACTION_EXAMPLES_API = process.env.LIT_ACTION_EXAMPLES_API ?? 'https://api.github.com/repos/LIT-Protocol/js-serverless-function-test/contents/js-sdkTests';