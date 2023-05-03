import fs from "fs/promises";
import process from "process";

/**
 * bumpVersion is a script that reads the package.json file, increments
 * the version number based on the provided flag (--major, --minor, or --patch),
 * and updates the package.json file with the new version number.
 *
 * Example usage:
 * ```
 * node bump-version.mjs --patch
 * ```
 */
async function bumpVersion() {
  const args = process.argv.slice(2);
  const bumpType = args.find((arg) => arg.startsWith("--"));

  if (!bumpType) {
    console.error("Please provide a bump type: --major, --minor, or --patch");
    return;
  }

  const packageJson = JSON.parse(await fs.readFile("package.json", "utf-8"));
  const [major, minor, patch] = packageJson.version.split(".").map(Number);

  switch (bumpType) {
    case "--major":
      packageJson.version = `${major + 1}.0.0`;
      break;
    case "--minor":
      packageJson.version = `${major}.${minor + 1}.0`;
      break;
    case "--patch":
      packageJson.version = `${major}.${minor}.${patch + 1}`;
      break;
    default:
      console.error("Invalid bump type. Use --major, --minor, or --patch");
      return;
  }

  await fs.writeFile("package.json", JSON.stringify(packageJson, null, 2));
  console.log(`Bumped version to ${packageJson.version}`);
}

bumpVersion();
