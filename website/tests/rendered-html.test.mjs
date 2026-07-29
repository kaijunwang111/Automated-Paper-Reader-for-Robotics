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
  assert.match(html, /跟踪具身智能最新/);
  assert.match(html, /论文与实验进展/);
  assert.match(html, /最新论文日报/);
  assert.match(html, /机器人公司动向/);
  assert.match(html, /检索论文数据库/);
  assert.match(html, /2026\.07\.27/);
  assert.doesNotMatch(html, /evidence score|综合分|可执行的研究判断|OUR FILTER/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("renders report, archive, database, paper, company, and about routes", async () => {
  const [archive, detail, database, paper, contactPaper, excludedPaper, memoryPaper, companies, about] =
    await Promise.all([
    render("/reports"),
    render("/reports/2026-07-27"),
    render("/papers"),
    render("/papers/2607.20683"),
    render("/papers/2607.20912"),
    render("/papers/2607.20748"),
    render("/papers/2607.18231"),
    render("/companies"),
    render("/about"),
    ]);

  assert.equal(archive.status, 200);
  assert.equal(detail.status, 200);
  assert.equal(database.status, 200);
  assert.equal(paper.status, 200);
  assert.equal(contactPaper.status, 200);
  assert.equal(excludedPaper.status, 404);
  assert.equal(memoryPaper.status, 200);
  assert.equal(companies.status, 200);
  assert.equal(about.status, 200);

  const [archiveHtml, detailHtml, databaseHtml, paperHtml, contactPaperHtml, memoryPaperHtml, companiesHtml, aboutHtml] =
    await Promise.all([
      archive.text(),
      detail.text(),
      database.text(),
      paper.text(),
      contactPaper.text(),
      memoryPaper.text(),
      companies.text(),
      about.text(),
    ]);

  assert.match(archiveHtml, /论文日报/);
  assert.match(detailHtml, /FELT/);
  assert.match(detailHtml, /felt-tactile\.github\.io/);
  assert.match(detailHtml, /项目页/);
  assert.match(detailHtml, /相对已有工作/);
  assert.match(detailHtml, /实验依据/);
  assert.match(detailHtml, /复现线索/);
  assert.match(detailHtml, /已确认资源/);
  assert.match(detailHtml, /实现线索/);
  assert.match(detailHtml, /仍缺少/);
  assert.match(detailHtml, /详细解读/);
  assert.match(detailHtml, /关键公式/);
  assert.match(detailHtml, /实验结果怎么读/);
  assert.match(detailHtml, /进一步思考/);
  assert.match(detailHtml, /DINOv2-B\/14/);
  assert.doesNotMatch(detailHtml, /综合分|评分|候选论文/);
  assert.doesNotMatch(detailHtml, /ZONDA|Impact Hammers in Mining|Robotic Craniotomy|Liquid Handling/);
  assert.doesNotMatch(
    detailHtml,
    /本次先从两个 arXiv 批次合并去重|运行产物与限制|配置修改|内部处理过程/,
  );
  assert.match(databaseHtml, /搜索标题、arXiv ID、机构、方法或详情属性/);
  assert.match(databaseHtml, /研究方向/);
  assert.match(databaseHtml, /训练与优化/);
  assert.match(databaseHtml, /创新模态/);
  assert.match(databaseHtml, /数据方法/);
  assert.match(databaseHtml, /机器人平台/);
  assert.match(databaseHtml, /部署与迁移/);
  assert.match(databaseHtml, /Real2Sim2Real/);
  assert.match(databaseHtml, /篇收录论文/);
  assert.match(databaseHtml, /Memory/);
  assert.match(databaseHtml, /Subtask/);
  assert.match(databaseHtml, /CoT/);
  assert.match(databaseHtml, /Pre-training/);
  assert.match(databaseHtml, /Post-training/);
  assert.match(databaseHtml, /Test-time Adaptation/);
  assert.match(databaseHtml, /数据质量 \/ 筛选/);
  assert.match(databaseHtml, /机械臂/);
  assert.match(databaseHtml, /其他/);
  assert.doesNotMatch(databaseHtml, />多模态</);
  assert.match(paperHtml, /返回论文数据库/);
  assert.match(paperHtml, /University of Southern California/);
  assert.match(paperHtml, /felt-tactile\.github\.io/);
  assert.match(paperHtml, /真机部署优化/);
  assert.match(contactPaperHtml, /URF: A Unified Robot Control-Policy Framework/);
  assert.doesNotMatch(contactPaperHtml, /真机部署优化/);
  assert.match(memoryPaperHtml, /Memory 实现/);
  assert.match(memoryPaperHtml, /Memory 时间跨度/);
  assert.match(memoryPaperHtml, /单个 episode 内长期保留/);
  assert.match(companiesHtml, /Physical Intelligence/);
  assert.match(companiesHtml, /每周一/);
  assert.match(companiesHtml, /最近检查：(?:<!-- -->)?2026\.07\.27/);
  assert.match(companiesHtml, /开源 GPU 加速医疗机器人物理仿真框架/);
  assert.match(companiesHtml, /Fremont 开始 Optimus 工厂施工与产线安装/);
  assert.match(companiesHtml, /LingBot-VLA 2\.0/);
  assert.match(companiesHtml, /TRACKING (?:<!-- -->)?12(?:<!-- -->)? COMPANIES/);
  assert.match(companiesHtml, /Tesla Optimus/);
  assert.match(companiesHtml, /宇树科技/);
  assert.match(companiesHtml, /逐际动力/);
  assert.match(companiesHtml, /星动纪元/);
  assert.match(companiesHtml, /众擎机器人/);
  assert.match(companiesHtml, /Genesis AI/);
  assert.match(companiesHtml, /Sharpa/);
  assert.match(aboutHtml, /范围、分类与公开边界/);
  assert.match(aboutHtml, /CoT/);
  assert.match(aboutHtml, /Memory 的/);
  assert.match(aboutHtml, /不为凑满固定篇数降低标准/);
  assert.match(aboutHtml, /官方博客或\s*官方仓库/);
});

test("ships original-paper figures and finished social metadata", async () => {
  const root = new URL("../", import.meta.url);
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const siteData = await readFile(new URL("../lib/site-data.ts", import.meta.url), "utf8");
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");

  await Promise.all([
    access(new URL("public/og.png", root)),
    access(new URL("public/report-assets/2026-07-23/2607.18236-method.png", root)),
    access(new URL("public/report-assets/2026-07-23/2607.18840-method.png", root)),
    access(new URL("public/report-assets/2026-07-23/2607.18231-method.png", root)),
  ]);

  assert.match(layout, /og\.png/);
  assert.doesNotMatch(siteData, /\bscore(?:Breakdown)?\b/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview|_sites-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
