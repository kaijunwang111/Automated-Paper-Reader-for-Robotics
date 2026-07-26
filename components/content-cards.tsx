import Link from "next/link";
import type { CompanyUpdate, Paper, Report } from "@/lib/site-data";
import { ArrowIcon } from "./site-shell";

export function ReportCard({
  report,
  featured = false,
}: {
  report: Report;
  featured?: boolean;
}) {
  return (
    <article className={`report-card ${featured ? "report-card-featured" : ""}`}>
      <div className="report-card-meta">
        <span className="mono">{report.date}</span>
        <span>{report.weekday}</span>
        <span>{report.papers.length} 篇精选</span>
      </div>
      <h3>{report.title}</h3>
      <p>{report.summary}</p>
      <div className="report-card-bottom">
        <div className="mini-paper-stack" aria-label="高分论文">
          {report.papers.slice(0, 3).map((paper) => (
            <span key={paper.arxivId}>
              <b>{paper.score.toFixed(2)}</b>
              {paper.title}
            </span>
          ))}
        </div>
        <Link className="round-link" href={`/reports/${report.slug}`} aria-label={`阅读 ${report.date} 日报`}>
          <ArrowIcon />
        </Link>
      </div>
    </article>
  );
}

export function CompanyCard({
  update,
  compact = false,
}: {
  update: CompanyUpdate;
  compact?: boolean;
}) {
  return (
    <article className={`company-card ${compact ? "company-card-compact" : ""}`}>
      <div className="company-head">
        <span
          className="company-monogram"
          style={{ "--company-color": update.color } as React.CSSProperties}
          aria-hidden="true"
        >
          {update.shortName}
        </span>
        <div>
          <h3>{update.company}</h3>
          <span className="company-source">{update.source}</span>
        </div>
      </div>
      <div className="company-date">
        <span className="status-dot" style={{ backgroundColor: update.color }} />
        {update.date} · {update.category}
      </div>
      <h4>{update.title}</h4>
      <p>{update.summary}</p>
      <a href={update.url} target="_blank" rel="noreferrer">
        查看官方来源 <ArrowIcon />
      </a>
    </article>
  );
}

export function PaperSummaryCard({ paper }: { paper: Paper }) {
  return (
    <article className="paper-summary-card">
      <div className="paper-rank">0{paper.rank}</div>
      <div className="paper-summary-main">
        <div className="paper-summary-top">
          <h3>{paper.title}</h3>
          <span className="score-pill">{paper.score.toFixed(3)}</span>
        </div>
        <p>{paper.signal}</p>
        <div className="tag-row">
          {paper.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
      <a
        className="paper-arxiv-link"
        href={paper.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`在 arXiv 查看 ${paper.title}`}
      >
        arXiv <ArrowIcon />
      </a>
    </article>
  );
}
