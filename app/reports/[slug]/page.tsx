import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaperSummaryCard } from "@/components/content-cards";
import { PaperDetail } from "@/components/paper-detail";
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
              <span>收录</span>
              <strong>{report.papers.length} paper overviews</strong>
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
            <span className="section-index">ISSUE OVERVIEW</span>
            <h2>本期概览</h2>
            <p>{report.overview}</p>
            <div className="paper-summary-list">
              {report.papers.map((paper) => (
                <PaperSummaryCard key={paper.arxivId} paper={paper} />
              ))}
            </div>
          </section>

          {report.papers.map((paper) => (
            <PaperDetail key={paper.arxivId} id={`paper-${paper.rank}`} paper={paper} />
          ))}
        </div>
      </div>
    </div>
  );
}
