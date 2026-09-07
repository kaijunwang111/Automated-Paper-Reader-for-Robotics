import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const outputRoot = fileURLToPath(new URL("../out/", import.meta.url));
const basePath = "/Automated-Paper-Reader-for-Robotics";

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = `${directory}/${entry.name}`;
      return entry.isDirectory() ? walk(path) : [path];
    }),
  );
  return nested.flat();
}

function outputPathForUrl(value) {
  const parsed = new URL(value, "https://kaijunwang111.github.io");
  if (!parsed.pathname.startsWith(basePath)) return null;

  const relative = decodeURIComponent(parsed.pathname.slice(basePath.length)).replace(/^\//, "");
  if (!relative) return `${outputRoot}/index.html`;
  return parsed.pathname.endsWith("/")
    ? `${outputRoot}/${relative}index.html`
    : `${outputRoot}/${relative}`;
}

test("exports every public route as static HTML", async () => {
  const required = [
    "index.html",
    "404.html",
    "companies/index.html",
    "papers/index.html",
    "reports/index.html",
    "reports/2026-09-07/index.html",
    "papers/2609.05266/index.html",
    "reports/2026-08-24/index.html",
    "papers/2608.21204/index.html",
    "reports/2026-08-14/index.html",
    "papers/2608.10232/index.html",
    "reports/2026-07-03/index.html",
    "papers/2607.01067/index.html",
  ];

  for (const relative of required) {
    assert.ok(existsSync(`${outputRoot}/${relative}`), `missing ${relative}`);
  }

  const reportEntries = await readdir(`${outputRoot}/reports`, { withFileTypes: true });
  const paperEntries = await readdir(`${outputRoot}/papers`, { withFileTypes: true });
  assert.ok(reportEntries.filter((entry) => entry.isDirectory()).length >= 10);
  assert.ok(paperEntries.filter((entry) => entry.isDirectory()).length >= 100);
});

test("prefixes routes, scripts, metadata, and paper figures for the project site", async () => {
  const home = await readFile(`${outputRoot}/index.html`, "utf8");
  const paper = await readFile(`${outputRoot}/papers/2607.01067/index.html`, "utf8");
  const companies = await readFile(`${outputRoot}/companies/index.html`, "utf8");

  assert.match(home, new RegExp(`href="${basePath}/reports/"`));
  assert.match(home, new RegExp(`src="${basePath}/_next/`));
  assert.match(
    paper,
    new RegExp(`src="${basePath}/report-assets/2026-07-03/2607\\.01067-overview\\.png"`),
  );
  assert.match(
    paper,
    /https:\/\/kaijunwang111\.github\.io\/Automated-Paper-Reader-for-Robotics\/og\.png/,
  );
  assert.match(companies, /首字母 A–Z/);
  assert.match(companies, /data-sort-mode="date"/);
  assert.doesNotMatch(paper, /(?:href|src)="\/(?:reports|papers|companies|report-assets|_next)\//);
});

test("does not emit broken local links or assets", async () => {
  const files = await walk(outputRoot);
  const htmlFiles = files.filter((file) => file.endsWith(".html"));
  const missing = [];

  for (const htmlFile of htmlFiles) {
    const html = await readFile(htmlFile, "utf8");
    const references = html.matchAll(/(?:href|src)="([^"#]+)"/g);
    for (const [, reference] of references) {
      const target = outputPathForUrl(reference);
      if (target && !existsSync(target)) {
        missing.push(`${htmlFile.replace(outputRoot, "out")} -> ${reference}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});

test("keeps the published artifact well below the Pages size limit", async () => {
  const files = await walk(outputRoot);
  let totalBytes = 0;
  let largestFigure = { file: "", bytes: 0 };

  for (const file of files) {
    const info = await stat(file);
    totalBytes += info.size;
    if (file.includes("/report-assets/") && info.size > largestFigure.bytes) {
      largestFigure = { file, bytes: info.size };
    }
  }

  assert.ok(totalBytes < 500 * 1024 * 1024, `static export is ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
  assert.ok(
    largestFigure.bytes < 8 * 1024 * 1024,
    `figure exceeds 8 MB: ${largestFigure.file}`,
  );
});
