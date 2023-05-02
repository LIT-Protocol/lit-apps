// generateIndex.mjs
import fs from "fs";
import path from "path";

const args = process.argv.slice(2);
const directoryPath = args[0];
const indexPath = args[1];

/**
 * A generator function that recursively lists all files in a given directory
 * @param dir - The directory to list the files in
 * @returns An async generator yielding each file path
 *
 * @example
 * for await (const file of getFiles("./my-directory")) {
 *   console.log(file);
 * }
 */
async function* getFiles(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

/**
 * Generate an index.ts file containing exports from all .tsx files within a directory.
 * @param directoryPath - The path to the directory containing .tsx files
 * @param indexPath - The path to the generated index.ts file
 */
async function generateIndexFile(directoryPath, indexPath) {
  let exports = [];

  for await (const file of getFiles(directoryPath)) {
    if (file.endsWith(".tsx") && !file.endsWith("index.tsx")) {
      const relativePath = path.relative(directoryPath, file);
      const importPath =
        "./" + relativePath.replace(/\.tsx$/, "").replace(/\\/g, "/");
      exports.push(`export * from '${importPath}';`);
    }
  }

  const currentDate = new Date();
  const dateComment = `// Generated on ${currentDate.toISOString()}\n\n`;

  fs.writeFileSync(indexPath, dateComment + exports.join("\n"));
}

// Usage example:
generateIndexFile(directoryPath, indexPath);
