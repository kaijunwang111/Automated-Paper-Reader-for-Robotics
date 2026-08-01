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
  assert.match(html, /2026\.08\.01/);
  assert.doesNotMatch(html, /evidence score|综合分|可执行的研究判断|OUR FILTER/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("renders report, archive, database, paper, company, and about routes", async () => {
  const [archive, latestDetail, latestPaper, officialPaper, detail, database, paper, contactPaper, excludedPaper, navigationPaper, traversabilityPaper, memoryPaper, companies, about] =
    await Promise.all([
    render("/reports"),
    render("/reports/2026-08-01"),
    render("/papers/2607.25895"),
    render("/papers/tau0-vla"),
    render("/reports/2026-07-27"),
    render("/papers"),
    render("/papers/2607.20683"),
    render("/papers/2607.20912"),
    render("/papers/2607.20748"),
    render("/papers/2607.21571"),
    render("/papers/2607.20679"),
    render("/papers/2607.18231"),
    render("/companies"),
    render("/about"),
    ]);

  assert.equal(archive.status, 200);
  assert.equal(latestDetail.status, 200);
  assert.equal(latestPaper.status, 200);
  assert.equal(officialPaper.status, 200);
  assert.equal(detail.status, 200);
  assert.equal(database.status, 200);
  assert.equal(paper.status, 200);
  assert.equal(contactPaper.status, 200);
  assert.equal(excludedPaper.status, 404);
  assert.equal(navigationPaper.status, 404);
  assert.equal(traversabilityPaper.status, 404);
  assert.equal(memoryPaper.status, 200);
  assert.equal(companies.status, 200);
  assert.equal(about.status, 200);

  const [archiveHtml, latestDetailHtml, latestPaperHtml, officialPaperHtml, detailHtml, databaseHtml, paperHtml, contactPaperHtml, memoryPaperHtml, companiesHtml, aboutHtml] =
    await Promise.all([
      archive.text(),
      latestDetail.text(),
      latestPaper.text(),
      officialPaper.text(),
      detail.text(),
      database.text(),
      paper.text(),
      contactPaper.text(),
      memoryPaper.text(),
      companies.text(),
      about.text(),
    ]);

  assert.match(archiveHtml, /论文日报/);
  assert.match(latestDetailHtml, /HiFi-UMI/);
  assert.match(latestDetailHtml, /τ0-VLA/);
  assert.match(latestDetailHtml, /960 次真机 rollout/);
  assert.doesNotMatch(latestDetailHtml, /MoMo: Dial Motion Mode/);
  assert.doesNotMatch(latestDetailHtml, /综合分|候选论文|内部评分/);
  assert.match(latestPaperHtml, /Simple AI/);
  assert.match(latestPaperHtml, /跨本体迁移/);
  assert.match(officialPaperHtml, /OFFICIAL PAPER/);
  assert.match(officialPaperHtml, /40,115 小时/);
  assert.match(officialPaperHtml, /github\.com\/sii-research\/tau-0-vla/);
  assert.match(detailHtml, /FELT/);
  assert.match(detailHtml, /felt-tactile\.github\.io/);
  assert.match(detailHtml, /项目页/);
  assert.match(detailHtml, /01 \/ 出发点/);
  assert.match(detailHtml, /02 \/ 方法/);
  assert.match(detailHtml, /03 \/ 模型结构/);
  assert.match(detailHtml, /04 \/ 数据组成/);
  assert.match(detailHtml, /05 \/ 实验内容和结论/);
  assert.match(detailHtml, /06 \/ 相比 baseline 的改进点/);
  assert.match(detailHtml, /亮点/);
  assert.match(detailHtml, /局限/);
  assert.match(detailHtml, /可借鉴点/);
  assert.match(detailHtml, /详细内容/);
  assert.match(detailHtml, /技术细节/);
  assert.match(detailHtml, /实验和消融测试/);
  assert.match(detailHtml, /可复现性/);
  assert.match(detailHtml, /触觉生成联合目标/);
  assert.match(detailHtml, /DINOv2-B\/14/);
  assert.doesNotMatch(detailHtml, /综合分|评分|候选论文/);
  assert.doesNotMatch(detailHtml, /实验依据|复现线索|详细解读|进一步思考/);
  assert.doesNotMatch(detailHtml, /只记录原文能够确认|未报告的试验次数或误差范围不会补写/);
  assert.doesNotMatch(detailHtml, /Beyond Episodic Evaluation|Capability-Aware Traversability|ZONDA|Impact Hammers in Mining|Robotic Craniotomy|Liquid Handling/);
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
  assert.doesNotMatch(databaseHtml, /Beyond Episodic Evaluation|Capability-Aware Traversability/);
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
    access(new URL("public/report-assets/2026-08-01/2607.25895-overview.png", root)),
  ]);

  assert.match(layout, /og\.png/);
  assert.doesNotMatch(siteData, /\bscore(?:Breakdown)?\b/);
  assert.doesNotMatch(layout, /Starter Project|codex-preview|_sites-preview/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});

function imageDimensions(buffer) {
  if (buffer.subarray(1, 4).toString("ascii") === "PNG") {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset + 8 < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const length = buffer.readUInt16BE(offset + 2);
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
        return { width: buffer.readUInt16BE(offset + 7), height: buffer.readUInt16BE(offset + 5) };
      }
      offset += 2 + length;
    }
  }

  throw new Error("Unsupported image format");
}

test("enforces the selected-paper figure quality manifest", async () => {
  const root = new URL("../", import.meta.url);
  const manifest = JSON.parse(
    await readFile(new URL("../quality/figure-manifests/2026-08-01.json", import.meta.url), "utf8"),
  );
  const reportResponse = await render("/reports/2026-08-01");
  const reportHtml = await reportResponse.text();

  assert.equal(manifest.papers.length, 15);
  assert.equal(new Set(manifest.papers.map((paper) => paper.paperId)).size, 15);
  assert.ok(manifest.papers.some((paper) => paper.paperId === "tau0-vla"));

  for (const paper of manifest.papers) {
    assert.ok(paper.figures.length >= 1 && paper.figures.length <= 2, `${paper.paperId} must have 1-2 figures`);
    for (const figure of paper.figures) {
      assert.match(figure.sourceUrl, /^https:\/\/(?:arxiv\.org|tau0-vla\.github\.io)\//);
      assert.match(figure.figureNumber, /^\d+[a-z]?$/i);
      assert.equal(figure.visualReview, "passed");
      assert.equal(figure.containsPageHeader, false);
      assert.equal(figure.completeFrame, true);

      const assetUrl = new URL(`public/report-assets/2026-08-01/${figure.file}`, root);
      const buffer = await readFile(assetUrl);
      const dimensions = imageDimensions(buffer);
      assert.deepEqual(dimensions, { width: figure.width, height: figure.height });
      assert.ok(dimensions.width >= 700, `${figure.file} is too narrow`);
      assert.ok(dimensions.height >= 180, `${figure.file} is too short`);
      assert.match(reportHtml, new RegExp(figure.file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  }
});
