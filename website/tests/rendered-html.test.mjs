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
  assert.match(html, /查看更多公司动态/);
  assert.equal((html.match(/<article class="company-card company-card-compact">/g) ?? []).length, 5);
  assert.match(html, /2026\.08\.07/);
  assert.match(html, /周五/);
  assert.doesNotMatch(html, /周六补跑|补跑|href="\/about"/);
  assert.doesNotMatch(html, /evidence score|综合分|可执行的研究判断|OUR FILTER/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview|react-loading-skeleton/);
});

test("renders public report, database, paper, and company routes", async () => {
  const [archive, latestDetail, latestPaper, officialPaper, detail, database, paper, contactPaper, excludedPaper, navigationPaper, traversabilityPaper, memoryPaper, companies, removedAbout] =
    await Promise.all([
    render("/reports"),
    render("/reports/2026-08-07"),
    render("/papers/2608.05042"),
    render("/papers/tau0-vla"),
    render("/reports/2026-07-23"),
    render("/papers"),
    render("/papers/2607.27549"),
    render("/papers/2607.28391"),
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
  assert.equal(removedAbout.status, 404);

  const [archiveHtml, latestDetailHtml, latestPaperHtml, officialPaperHtml, detailHtml, databaseHtml, paperHtml, contactPaperHtml, memoryPaperHtml, companiesHtml] =
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
    ]);

  assert.match(archiveHtml, /论文日报/);
  assert.match(archiveHtml, /2026\.08\.07/);
  assert.match(archiveHtml, /2026\.07\.24/);
  assert.doesNotMatch(archiveHtml, /周六补跑|补跑/);
  assert.match(latestDetailHtml, /REPORT (?:<!-- -->)?2026\/08\/07/);
  assert.match(latestDetailHtml, /BridgeVLA\+\+/);
  assert.match(latestDetailHtml, /RoboReact/);
  assert.match(latestDetailHtml, /RMBench 18\.9% 提到 96\.0%/);
  assert.doesNotMatch(latestDetailHtml, /MoMo: Dial Motion Mode/);
  assert.doesNotMatch(latestDetailHtml, /综合分|候选论文|内部评分/);
  assert.match(latestPaperHtml, /Institute of Automation, Chinese Academy of Sciences/);
  assert.match(latestPaperHtml, /Spatio-Temporal Memory/);
  assert.match(officialPaperHtml, /OFFICIAL PAPER/);
  assert.match(officialPaperHtml, /40,115 小时/);
  assert.match(officialPaperHtml, /github\.com\/sii-research\/tau-0-vla/);
  assert.match(detailHtml, /FELT/);
  assert.match(detailHtml, /Masked Visual Actions for Unified World Modeling/);
  assert.match(detailHtml, /masked-visual-actions\.github\.io/);
  assert.match(detailHtml, /BEHAVIOR-1K 未见双臂本体/);
  assert.doesNotMatch(detailHtml, /复查后加入|补录|保持中性|neutral calibration/);
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
  assert.match(paperHtml, /Stanford University/);
  assert.match(paperHtml, /ajaysridhar\.com\/barx/);
  assert.match(paperHtml, /跨本体迁移/);
  assert.match(contactPaperHtml, /TacWAM: Anchor-Guided World Action Model/);
  assert.doesNotMatch(contactPaperHtml, /真机部署优化/);
  assert.match(memoryPaperHtml, /Memory 实现/);
  assert.match(memoryPaperHtml, /Memory 时间跨度/);
  assert.match(memoryPaperHtml, /单个 episode 内完整力历史/);
  assert.match(companiesHtml, /Physical Intelligence/);
  assert.match(companiesHtml, /每周一/);
  assert.match(companiesHtml, /最近检查：(?:<!-- -->)?2026\.08\.03/);
  assert.match(companiesHtml, /开源 GPU 加速医疗机器人物理仿真框架/);
  assert.match(companiesHtml, /Fremont 开始 Optimus 工厂施工与产线安装/);
  assert.match(companiesHtml, /LingBot-VLA 2\.0/);
  assert.match(companiesHtml, /TRACKING (?:<!-- -->)?24(?:<!-- -->)? COMPANIES/);
  assert.match(companiesHtml, /Tesla Optimus/);
  assert.match(companiesHtml, /宇树科技/);
  assert.match(companiesHtml, /逐际动力/);
  assert.match(companiesHtml, /星动纪元/);
  assert.match(companiesHtml, /众擎机器人/);
  assert.match(companiesHtml, /Genesis AI/);
  assert.match(companiesHtml, /Sharpa/);
  assert.match(companiesHtml, /Figure AI/);
  assert.match(companiesHtml, /1X Technologies/);
  assert.match(companiesHtml, /Boston Dynamics/);
  assert.match(companiesHtml, /银河通用 Galbot/);
  assert.match(companiesHtml, /星海图 Galaxea AI/);
  assert.match(companiesHtml, /腾讯 Robotics X/);
  assert.match(companiesHtml, /最近更新优先/);
  assert.match(companiesHtml, /最近更新/);
  assert.match(companiesHtml, /首字母 A–Z/);
  assert.match(companiesHtml, /data-sort-mode="date"/);
  const renderedCompanyDates = [
    ...companiesHtml.matchAll(
      /<div class="timeline-item" data-company-date="([^"]+)" data-company-name="[^"]+">/g,
    ),
  ].map((match) => match[1]);
  assert.equal(renderedCompanyDates.length, 24);
  assert.deepEqual(renderedCompanyDates, [...renderedCompanyDates].sort().reverse());
  assert.doesNotMatch(companiesHtml, /官方信号优先|SOURCE POLICY/);
});

test("ships original-paper figures and finished social metadata", async () => {
  const root = new URL("../", import.meta.url);
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  const siteData = await readFile(new URL("../lib/site-data.ts", import.meta.url), "utf8");
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");

  await Promise.all([
    access(new URL("public/og.png", root)),
    access(new URL("public/report-assets/2026-07-24/2607.18236-method.png", root)),
    access(new URL("public/report-assets/2026-07-24/2607.20033-method.png", root)),
    access(new URL("public/report-assets/2026-07-24/2607.19343-overview.png", root)),
    access(new URL("public/report-assets/2026-07-24/2607.21670-method.png", root)),
    access(new URL("public/report-assets/2026-07-20/2607.16506-overview.png", root)),
    access(new URL("public/report-assets/2026-07-24/2607.19190-overview.png", root)),
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

test("enforces selected-paper figure quality manifests", async () => {
  const root = new URL("../", import.meta.url);
  const manifests = [
    { file: "2026-08-07.json", route: "/reports/2026-08-07", assetDate: "2026-08-07", count: 8, minWidth: 700 },
    { file: "2026-06-29.json", route: "/reports/2026-06-29", assetDate: "2026-06-29", count: 12, minWidth: 700 },
    { file: "2026-07-03.json", route: "/reports/2026-07-03", assetDate: "2026-07-03", count: 14, minWidth: 700 },
    { file: "2026-07-06.json", route: "/reports/2026-07-06", assetDate: "2026-07-06", count: 12, minWidth: 700 },
    { file: "2026-07-10.json", route: "/reports/2026-07-10", assetDate: "2026-07-10", count: 12, minWidth: 700 },
    { file: "2026-07-13.json", route: "/reports/2026-07-13", assetDate: "2026-07-13", count: 8, minWidth: 700 },
    { file: "2026-07-17.json", route: "/reports/2026-07-17", assetDate: "2026-07-17", count: 13, minWidth: 550 },
    { file: "2026-07-20.json", route: "/reports/2026-07-20", assetDate: "2026-07-20", count: 8, minWidth: 550 },
    { file: "2026-07-24.json", route: "/reports/2026-07-23", assetDate: "2026-07-24", count: 18, minWidth: 700 },
    { file: "2026-07-27.json", route: "/reports/2026-07-27", assetDate: "2026-07-27", count: 5, minWidth: 700 },
    { file: "2026-08-01.json", route: "/reports/2026-07-31", assetDate: "2026-08-01", count: 16, minWidth: 700 },
    { file: "2026-08-03.json", route: "/reports/2026-08-03", assetDate: "2026-08-03", count: 9, minWidth: 700 },
  ];

  for (const entry of manifests) {
    const manifest = JSON.parse(
      await readFile(new URL(`../quality/figure-manifests/${entry.file}`, import.meta.url), "utf8"),
    );
    const reportHtml = await (await render(entry.route)).text();

    assert.equal(manifest.papers.length, entry.count);
    assert.equal(new Set(manifest.papers.map((paper) => paper.paperId)).size, entry.count);

    for (const paper of manifest.papers) {
      assert.ok(paper.figures.length >= 1 && paper.figures.length <= 2, `${paper.paperId} must have 1-2 figures`);
      for (const figure of paper.figures) {
        assert.match(figure.sourceUrl, /^https:\/\//);
        assert.match(figure.figureNumber, /^\d+[a-z]?$/i);
        assert.equal(figure.visualReview, "passed");
        assert.equal(figure.containsPageHeader, false);
        assert.equal(figure.completeFrame, true);

        const assetUrl = new URL(`public/report-assets/${entry.assetDate}/${figure.file}`, root);
        const buffer = await readFile(assetUrl);
        const dimensions = imageDimensions(buffer);
        assert.deepEqual(dimensions, { width: figure.width, height: figure.height });
        assert.ok(dimensions.width >= entry.minWidth, `${figure.file} is too narrow`);
        assert.ok(dimensions.height >= 180, `${figure.file} is too short`);
        assert.match(reportHtml, new RegExp(figure.file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      }
    }
  }
});
