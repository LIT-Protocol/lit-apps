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

function removeBackticks(str: any): string { // Changed type to 'any' for demonstration
  // Ensure 'str' is a string
  if (typeof str !== 'string') {
    // Optionally, handle the case where 'str' is not a string
    console.error('Provided value is not a string:', str);
    return ''; // Return an empty string or handle as needed
  }

  // Check if the first character is a backtick
  if (str.startsWith('`')) {
    str = str.substring(1);
  }

  // Check if the last character is a backtick
  if (str.endsWith('`')) {
    str = str.substring(0, str.length - 1);
  }

  return str;
}

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
  // const exportName = `${fileName.split('.')[0]}Action`;
  let innerContent: any = content.match(regex);

  if (innerContent == null) {
    return null;
  }

  innerContent = removeBackticks(innerContent[0]);

  // return `export const ${exportName} = ${innerContent}`;
  return innerContent;
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