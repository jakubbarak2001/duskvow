import sharp from "sharp";
import { readdir, stat, access } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Node icon converter: source images at public/images/nodes/{name}.{png,jpg}
 * get resized to 128x128 WebP (quality 90, Lanczos3) in the same folder,
 * overwriting any existing .webp of the same name.
 *
 * Usage:
 *   node scripts/convert-node-icons.mjs                       # all four
 *   node scripts/convert-node-icons.mjs habit keystone choice # subset
 *
 * Auto-detects .png or .jpg source. Safe to re-run.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const NODE_DIR = join(__dirname, "..", "public", "images", "nodes");
const ALL_TARGETS = ["habit", "action", "choice", "keystone"];
const SIZE = 128;
const QUALITY = 90;

const argv = process.argv.slice(2);
const targets = argv.length > 0 ? argv : ALL_TARGETS;

async function findSource(name) {
  for (const ext of ["png", "jpg", "jpeg"]) {
    const path = join(NODE_DIR, `${name}.${ext}`);
    try {
      await access(path);
      return path;
    } catch {
      // try next extension
    }
  }
  return null;
}

for (const name of targets) {
  if (!ALL_TARGETS.includes(name)) {
    console.error(`SKIP ${name}: not a known node type (${ALL_TARGETS.join(", ")})`);
    process.exitCode = 1;
    continue;
  }
  const input = await findSource(name);
  if (!input) {
    console.error(`FAILED ${name}: no .png/.jpg source found`);
    process.exitCode = 1;
    continue;
  }
  const output = join(NODE_DIR, `${name}.webp`);
  try {
    const meta = await sharp(input).metadata();
    const inBytes = (await stat(input)).size;
    await sharp(input)
      .resize(SIZE, SIZE, { kernel: "lanczos3", fit: "cover" })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(output);
    const outBytes = (await stat(output)).size;
    const ext = input.split(".").pop();
    console.log(
      `${name.padEnd(9)} ${meta.width}x${meta.height} ${ext} ${(inBytes / 1024).toFixed(0)}KB -> ${SIZE}x${SIZE} webp ${(outBytes / 1024).toFixed(1)}KB`,
    );
  } catch (err) {
    console.error(`FAILED ${name}:`, err instanceof Error ? err.message : err);
    process.exitCode = 1;
  }
}

const dirContents = await readdir(NODE_DIR);
console.log("\nFinal directory contents:", dirContents.sort().join(", "));
