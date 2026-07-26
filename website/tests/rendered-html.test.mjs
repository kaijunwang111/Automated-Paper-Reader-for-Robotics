import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished research portal", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>具身智能观察站<\/title>/);
  assert.match(html, /把每天涌现的机器人论文/);
  assert.match(html, /最新论文日报/);
  assert.match(html, /机器人公司动向/);
  assert.match(html, /2026\.07\.23/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("renders report, archive, and company routes", async () => {
  const [archive, detail, companies] = await Promise.all([
    render("/reports"),
    render("/reports/2026-07-23"),
    render("/companies"),
  ]);

  assert.equal(archive.status, 200);
  assert.equal(detail.status, 200);
  assert.equal(companies.status, 200);

  const [archiveHtml, detailHtml, companiesHtml] = await Promise.all([
    archive.text(),
    detail.text(),
    companies.text(),
  ]);

  assert.match(archiveHtml, /论文日报/);
  assert.match(detailHtml, /Patch Policy/);
  assert.match(detailHtml, /2607\.18236-method\.png/);
  assert.match(detailHtml, /综合分构成/);
  assert.doesNotMatch(
    detailHtml,
    /本次先从两个 arXiv 批次合并去重|运行产物与限制|配置修改|内部处理过程/,
  );
  assert.match(companiesHtml, /Physical Intelligence/);
  assert.match(companiesHtml, /每周五/);
  assert.match(companiesHtml, /LingBot-VLA 2\.0/);
});

test("ships original-paper figures and finished social metadata", async () => {
  const root = new URL("../", import.meta.url);
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");

  await Promise.all([
    access(new URL("public/og.png", root)),
    access(new URL("public/report-assets/2026-07-23/2607.18236-method.png", root)),
    access(new URL("public/report-assets/2026-07-23/2607.18840-method.png", root)),
    access(new URL("public/report-assets/2026-07-23/2607.18231-method.png", root)),
  ]);

  assert.match(layout, /og\.png/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview|_sites-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
