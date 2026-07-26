import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaperSummaryCard } from "@/components/content-cards";
import { ArrowIcon } from "@/components/site-shell";
import { getReport, reports } from "@/lib/site-data";

export function generateStaticParams() {
  return reports.map((report) => ({ slug: report.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const report = getReport(slug);
  return {
    title: report ? `${report.date} 论文日报` : "论文日报",
    description: report?.summary,
  };
}

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = getReport(slug);

  if (!report) {
    notFound();
  }

  return (
    <div className="report-detail-page">
      <header className="report-detail-hero">
        <div className="shell">
          <Link className="back-link" href="/reports">
            ← 返回日报归档
          </Link>
          <div className="report-kicker">
            <span>REPORT {report.slug.replaceAll("-", "/")}</span>
            <span>{report.weekday}</span>
          </div>
          <h1>{report.title}</h1>
          <p>{report.summary}</p>
          <div className="report-facts">
            <div>
              <span>覆盖时间</span>
              <strong>{report.range}</strong>
            </div>
            <div>
              <span>候选</span>
              <strong>{report.candidateCount} papers</strong>
            </div>
            <div>
              <span>精选</span>
              <strong>{report.papers.length} deep reads</strong>
            </div>
            <div>
              <span>数据源</span>
              <strong>arXiv only</strong>
            </div>
          </div>
        </div>
      </header>

      <div className="shell report-body-layout">
        <aside className="report-toc">
          <span className="panel-label">CONTENTS</span>
          {report.papers.map((paper) => (
            <a key={paper.arxivId} href={`#paper-${paper.rank}`}>
              <span>0{paper.rank}</span>
              {paper.title}
            </a>
          ))}
        </aside>

        <div className="report-content">
          <section className="report-overview">
            <span className="section-index">EDITOR&apos;S VIEW</span>
            <h2>本期判断</h2>
            <p>{report.trend}</p>
            <div className="paper-summary-list">
              {report.papers.map((paper) => (
                <PaperSummaryCard key={paper.arxivId} paper={paper} />
              ))}
            </div>
          </section>

          {report.papers.map((paper) => (
            <article className="paper-detail" id={`paper-${paper.rank}`} key={paper.arxivId}>
              <div className="paper-detail-heading">
                <div>
                  <span className="paper-detail-rank">SELECTED / 0{paper.rank}</span>
                  <h2>{paper.title}</h2>
                  <div className="institution-list">
                    {paper.institutions.map((institution) => (
                      <span key={institution}>{institution}</span>
                    ))}
                  </div>
                </div>
                <div className="score-box">
                  <span>综合分</span>
                  <strong>{paper.score.toFixed(3)}</strong>
                  <small>/ 5.000</small>
                </div>
              </div>

              {paper.figure ? (
                <figure className="method-figure">
                  <div className="figure-frame">
                    <img src={paper.figure.src} alt={paper.figure.alt} />
                  </div>
                  <figcaption>
                    <span>{paper.figure.caption}</span>
                    <a href={paper.url} target="_blank" rel="noreferrer">
                      原论文 <ArrowIcon />
                    </a>
                  </figcaption>
                </figure>
              ) : null}

              <div className="paper-analysis-grid">
                <section>
                  <span className="analysis-label">01 / 出发点</span>
                  <p>{paper.motivation}</p>
                </section>
                <section>
                  <span className="analysis-label">02 / 模型结构</span>
                  <p>{paper.architecture}</p>
                </section>
                <section>
                  <span className="analysis-label">03 / 优化阶段</span>
                  <p>{paper.optimization}</p>
                </section>
                <section>
                  <span className="analysis-label">04 / 数据组成</span>
                  <p>{paper.data}</p>
                </section>
                <section className="analysis-wide">
                  <span className="analysis-label">05 / 实验内容与结果</span>
                  <p>{paper.experiments}</p>
                </section>
              </div>

              <div className="judgement-grid">
                <section className="judgement-card judgement-positive">
                  <span>亮点</span>
                  <p>{paper.strengths}</p>
                </section>
                <section className="judgement-card judgement-caution">
                  <span>局限</span>
                  <p>{paper.limitations}</p>
                </section>
                <section className="judgement-card judgement-transfer">
                  <span>迁移价值</span>
                  <p>{paper.transfer}</p>
                </section>
              </div>

              <section className="score-breakdown">
                <div>
                  <span className="analysis-label">综合分构成</span>
                  <p>实验分关注真机、消融、泛化、任务复杂度与评测可信度，而不是只看成功率数字。</p>
                </div>
                <div className="score-bars">
                  {paper.scoreBreakdown.map((item) => (
                    <div className="score-row" key={item.label}>
                      <span>{item.label}</span>
                      <div className="score-track">
                        <i style={{ width: `${(item.value / 5) * 100}%` }} />
                      </div>
                      <b>{item.value.toFixed(1)}</b>
                    </div>
                  ))}
                </div>
              </section>

              <a className="arxiv-button" href={paper.url} target="_blank" rel="noreferrer">
                阅读 arXiv 原文 <ArrowIcon />
              </a>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
