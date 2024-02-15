import express, { Express, Request, Response } from "express";
import bodyParser from "body-parser";
import { GITHUB_LIT_ACTION_EXAMPLES_REPO_TOKEN, LIT_ACTION_EXAMPLES_API } from "../../env";
const HEADER = {
  headers: {
    Authorization: `token ${GITHUB_LIT_ACTION_EXAMPLES_REPO_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
  }
};

const cache = [];

async function getFiles() {
  const response = await fetch(LIT_ACTION_EXAMPLES_API, HEADER);
  const data = await response.json();
  return data; // This returns an array of file objects
}

async function getFileContent(url: string, fileName: string) {
  const response = await fetch(url, HEADER);
  const data = await response.json();
  // GitHub API returns the content in base64, so we need to decode it
  const content = Buffer.from(data.content, 'base64').toString('utf-8');

  // -- only get between the ` ` quote and export it 
  const regex = /`([^`]+)`/g;
  const exportName = `${fileName.split('.')[0]}Action`;
  const innerContent = content.match(regex);

  if (innerContent == null) {
    return null;
  }

  return `export const ${exportName} = ${innerContent}`;
}

async function listFilesAndContents() {
  const files = await getFiles();

  console.log("files:", files);

  for (const file of files) {
    const content = await getFileContent(file.url, file.name);

    if (content) {
      cache.push({
        file: file.name,
        content: content,
      })
    } else {
      console.log(`${file.name} is empty`);
    }

  }

  return cache;
}

listFilesAndContents().then((d) => {
  console.log(d);
})

setInterval(async () => {
  listFilesAndContents().then((d) => {
    console.log(d);
  })
}, 10 * 60 * 1000);

export const litActionsHandler: Express = express();
litActionsHandler.use(bodyParser.json());
litActionsHandler.get('/lit-action/examples', async (req, res) => {
  return res.status(200).json({
    success: true,
    data: cache.length <= 0 ? 'not ready yet' : cache,
  })
})