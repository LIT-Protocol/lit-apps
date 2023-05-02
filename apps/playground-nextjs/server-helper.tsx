// utils.ts
import fs from "fs";

interface PackageJson {
  dependencies: Record<string, string>;
}

/**
 * Reads and parses the package.json file in the root of the project
 * @returns An object representing the package.json content
 * @throws An error if the package.json file cannot be found
 */
export function getPackageJson() {
  try {
    return JSON.parse(fs.readFileSync("./package.json", "utf8"));
  } catch (e) {
    throw new Error(
      "Could not find package.json in the root of your project. Please make sure you are running this command from the root of your project."
    );
  }
}

/**
 * Reads the content of the current file
 * @returns A string representing the content of the current file
 * @throws An error if the current file cannot be found
 */
export function getFileContent() {
  const filename =
    "./pages/" + __filename.split("/").pop()?.replace(".js", ".tsx");

  try {
    return fs.readFileSync(filename, "utf8");
  } catch (e) {
    throw new Error(
      "Could not find file: " +
        filename +
        ". Please make sure you are running this command from the root of your project."
    );
  }
}

/**
 * Extracts lines with the comment "// <== include this" and removes the comment
 * @param input - The input string to search for lines to include
 * @returns A string containing the lines with the specified comment, without the comment itself
 */
function extractIncludedLines(input: string): string {
  const lines = input.split("\n");
  const includedLines = lines
    .filter((line) => line.trim().endsWith("// <== include this"))
    .map((line) => line.replace("// <== include this", "").trim());
  return includedLines.join("\n");
}

/**
 * Extracts content between the start and end markers in a given string
 * @param content - The input string containing the content
 * @param startMarker - The start marker string to identify the start of the desired content
 * @param endMarker - The end marker string to identify the end of the desired content
 * @returns The string containing only the content between the start and end markers
 *
 * Usage example:
 * const content = "// Starts\ncontent to keep\n// Ends\nextra content";
 * const result = extractContentBetweenMarkers(content, "// Starts", "// Ends");
 */
function extractContentBetweenMarkers(
  content: string,
  startMarker: string,
  endMarker: string
): string {
  const startIndex = content.indexOf(startMarker) + startMarker.length;
  const endIndex = content.indexOf(endMarker);

  return content.slice(startIndex, endIndex).trim();
}

/**
 * Filters an object of dependencies based on a given array of strings
 * @param packageJson - The object representing the package.json content
 * @param strs - An array of strings to filter the dependencies by
 * @returns An array of objects containing the name and version of the filtered dependencies
 */
export function filterLitDependencies(
  packageJson: PackageJson,
  strs: string[] = ["@lit-protocol"]
) {
  const arr: Array<{ name: string; version: string }> = [];

  Object.keys(packageJson.dependencies).forEach((key) => {
    for (const str of strs) {
      if (key.includes(str)) {
        arr.push({ name: key, version: packageJson.dependencies[key] });
        break;
      }
    }
  });

  return arr;
}

/**
 * Retrieves the Lit dependencies and the current file content
 * @param strs - An optional array of strings to filter the dependencies by (default is ["@lit-protocol"])
 * @returns An object containing the package.json content, an array of Lit dependencies, and the processed file content
 */
export function getLitDependenciesAndFile(strs: string[] = ["@lit-protocol"]) {
  const packageJson = getPackageJson();

  const arr = filterLitDependencies(packageJson, strs);

  const fileContent = getFileContent();

  const importPart = extractIncludedLines(fileContent);

  const logicPart = extractContentBetweenMarkers(
    fileContent,
    "// Starts",
    "// Ends"
  );

  const finalCode = [importPart, logicPart].join("\n\n");

  return {
    packageJson,
    litDependencies: arr,
    thisFile: finalCode,
  };
}
