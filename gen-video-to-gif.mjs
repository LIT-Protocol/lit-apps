// gen-video-to-gif.mjs
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

const FPS = 10;
const SCALE = 100;
const DEFAULT_INPUT_DIR = "./videos";
const DEFAULT_OUTPUT_DIR = "./gifs";

/**
 * Convert a video clip into a GIF.
 *
 * Usage:
 * node gen-video-to-gif.mjs --input=input.mov --output=output.gif --fps=10 --scale=100
 * node gen-video-to-gif.mjs --inputDir=./videos --outputDir=./gifs --fps=10 --scale=100
 * node gen-video-to-gif.mjs
 */
async function genVideoToGif(input, output, fps = FPS, scale = SCALE) {
  try {
    // Check if the output file exists and delete it if it does
    try {
      await fs.access(output);
      await fs.unlink(output);
      console.log(`Existing GIF deleted: ${output}`);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(`Failed to delete existing GIF: ${error.message}`);
        return;
      }
    }

    await execAsync(
      `ffmpeg -i ${input} -vf "fps=${fps},scale=${scale}:-1:flags=lanczos" -c:v gif ${output}`
    );
    console.log(`GIF created successfully: ${output}`);
  } catch (error) {
    console.error(`Failed to create GIF: ${error.message}`);
  }
}

async function processDirectory(inputDir, outputDir, fps = FPS, scale = SCALE) {
  const entries = await fs.readdir(inputDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(inputDir, entry.name);

    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && path.extname(entry.name) === ".mov") {
      const output = path.join(
        outputDir,
        `${path.basename(entry.name, ".mov")}.gif`
      );
      await genVideoToGif(fullPath, output, fps, scale);
    }
  }
}

const args = process.argv.slice(2);
const inputIndex = args.findIndex((arg) => arg.startsWith("--input="));
const outputIndex = args.findIndex((arg) => arg.startsWith("--output="));
const fpsIndex = args.findIndex((arg) => arg.startsWith("--fps="));
const scaleIndex = args.findIndex((arg) => arg.startsWith("--scale="));
const inputDirIndex = args.findIndex((arg) => arg.startsWith("--inputDir="));
const outputDirIndex = args.findIndex((arg) => arg.startsWith("--outputDir="));

console.log("Starting GIF generation...");
const fps = args[fpsIndex]?.split("=")[1] ?? FPS;
const scale = args[scaleIndex]?.split("=")[1] ?? SCALE;
const inputDir = args[inputDirIndex]?.split("=")[1] ?? DEFAULT_INPUT_DIR;
const outputDir = args[outputDirIndex]?.split("=")[1] ?? DEFAULT_OUTPUT_DIR;

if (inputIndex !== -1 && outputIndex !== -1) {
  const input = args[inputIndex].split("=")[1];
  const output = args[outputIndex].split("=")[1];

  console.log("input", input);
  console.log("output", output);

  genVideoToGif(input, output, fps, scale);
} else {
  processDirectory(inputDir, outputDir, fps, scale);
}
