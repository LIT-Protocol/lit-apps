import * as dotenv from "dotenv";
dotenv.config();

// https://github.com/LIT-Protocol/lit-assets/tree/develop/rust/lit-core/lit-blockchain/abis
// -- config
const TOKEN = process.env.GITHUB_LIT_ASSETS_REAL_ONLY_API;
const USERNAME = "LIT-Protocol";
const REPO_NAME = "lit-assets";

const createPath = (PATH: string) => {
  return `https://api.github.com/repos/${USERNAME}/${REPO_NAME}/contents/${PATH}`;
};

const HEADER = {
  headers: {
    Authorization: `token ${TOKEN}`,
    Accept: "application/vnd.github.v3+json",
  },
};

export async function getLitContractABIs() {
  const contractsData = [];

  console.log(`Getting directory...`);
  console.log(`Token: ${TOKEN}`);

  let files: any;

  try {
    const filesRes = await fetch(
      createPath("rust/lit-core/lit-blockchain/abis"),
      HEADER
    );
    files = await filesRes.json();
  } catch (e) {
    throw new Error(`GITHUB_LIT_ASSETS_REAL_ONLY_API might be wrong. ${e}`);
  }

  for (const file of files) {
    console.log(`Getting file ${file.name}`);
    console.log(`Download content from ${file.download_url}`);

    const fileRes = await fetch(file.download_url, HEADER);

    const fileData = await fileRes.json();

    contractsData.push({
      name: file.name,
      contractName: fileData.contractName,
      data: fileData.abi,
    });
  }

  if (!contractsData.length) {
    throw new Error("No data");
  }

  return contractsData;
}
