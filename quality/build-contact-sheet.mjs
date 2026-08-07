import { mkdir, readFile, readdir } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import sharp from "sharp";

const reportDate = process.argv[2];
if (!reportDate) {
  throw new Error("Usage: node quality/build-contact-sheet.mjs YYYY-MM-DD");
}

const root = resolve(import.meta.dirname, "..");
const assetDir = join(root, "public", "report-assets", reportDate);
const outputDir = join(root, "quality", "contact-sheets");
const allFiles = (await readdir(assetDir))
  .filter((file) => /\.(png|jpe?g)$/i.test(file))
  .sort();
let files = allFiles;

try {
  const manifest = JSON.parse(
    await readFile(join(root, "quality", "figure-manifests", `${reportDate}.json`), "utf8"),
  );
  const selectedFiles = manifest.papers.flatMap((paper) =>
    paper.figures.map((figure) => figure.file),
  );
  if (selectedFiles.length > 0) {
    files = [...new Set(selectedFiles)].sort();
  }
} catch {
  // A new report may build its first contact sheet before its manifest exists.
}

const tileWidth = 520;
const imageHeight = 260;
const labelHeight = 54;
const tileHeight = imageHeight + labelHeight;
const columns = 2;
const rows = Math.ceil(files.length / columns);

const composites = [];
for (const [index, file] of files.entries()) {
  const input = join(assetDir, file);
  const image = await sharp(input)
    .resize(tileWidth - 20, imageHeight - 20, { fit: "contain", background: "#ffffff" })
    .extend({ top: 10, bottom: 10, left: 10, right: 10, background: "#ffffff" })
    .png()
    .toBuffer();
  const label = Buffer.from(
    `<svg width="${tileWidth}" height="${labelHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#0b1220"/>
      <text x="16" y="34" font-family="Arial, sans-serif" font-size="18" fill="#f8fafc">${basename(file)}</text>
    </svg>`,
  );
  const tile = await sharp({
    create: { width: tileWidth, height: tileHeight, channels: 3, background: "#ffffff" },
  })
    .composite([
      { input: image, top: 0, left: 0 },
      { input: label, top: imageHeight, left: 0 },
    ])
    .png()
    .toBuffer();
  composites.push({
    input: tile,
    left: (index % columns) * tileWidth,
    top: Math.floor(index / columns) * tileHeight,
  });
}

await mkdir(outputDir, { recursive: true });
const output = join(outputDir, `${reportDate}.png`);
await sharp({
  create: {
    width: columns * tileWidth,
    height: rows * tileHeight,
    channels: 3,
    background: "#e2e8f0",
  },
})
  .composite(composites)
  .png()
  .toFile(output);

for (const file of files) {
  const metadata = await sharp(join(assetDir, file)).metadata();
  console.log(`${file}\t${metadata.width}x${metadata.height}`);
}
console.log(`Contact sheet: ${output}`);
