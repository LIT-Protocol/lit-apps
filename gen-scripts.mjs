import { promises as fs } from 'fs';
import path from 'path';

const appsDir = './apps';

async function generateScripts(dryRun = false) {
  try {
    // Read the apps directory
    const folders = await fs.readdir(appsDir, { withFileTypes: true });

    // Filter for only directories
    const appNames = folders
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    // Generate scripts for each app
    const scripts = {};

    for (const appName of appNames) {
      const deleteCommands = appNames
        .filter(name => name !== appName)
        .map(name => `rm -rf apps/${name}`)
        .join(' && ');

      // Replace 'yarn build' with the new command
      scripts[`cloud:build:${appName}`] = `${deleteCommands} && yarn && yarn build`;
      scripts[`heroku:build:${appName}`] = `${deleteCommands} && yarn && yarn build`;
    }

    if (dryRun) {
      // If dry run, just log the scripts
      console.log(scripts);
    } else {
      // Otherwise, update the package.json file
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      packageJson.scripts = { ...packageJson.scripts, ...scripts };
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Updated package.json with new scripts.');
    }
  } catch (error) {
    console.error('Error generating scripts:', error);
  }
}

// Check for the --dry-run argument
const dryRun = process.argv.includes('--dry-run');
generateScripts(dryRun);
