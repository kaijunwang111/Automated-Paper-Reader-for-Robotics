import Link from "next/link";
import { CompanyCard, ReportCard } from "@/components/content-cards";
import { ArrowIcon } from "@/components/site-shell";
import { companyUpdates, paperCategories, paperRecords, reports } from "@/lib/site-data";

export default function Home() {
  const latest = reports[0];

  return (
    <>
      <section className="hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="shell hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" />
              EMBODIED INTELLIGENCE RESEARCH FEED
            </div>
            <h1>
              <span>跟踪具身智能最新</span>
              <span>论文与实验进展</span>
            </h1>
            <p>
              聚焦具身智能、VLA、机器人学习与真机部署，整理模型结构、训练数据、
              实验设置、结果与局限。
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href={`/reports/${latest.slug}`}>
                阅读最新日报 <ArrowIcon />
              </Link>
              <Link className="button button-secondary" href="/papers">
                检索论文数据库
              </Link>
            </div>
          </div>
          <div className="hero-console" aria-label="网站信息">
            <div className="console-top">
              <span>RESEARCH SIGNAL</span>
              <span className="mono">2026 / 07</span>
            </div>
            <div className="signal-orbit">
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="signal-core">
                <span>DATA SOURCE</span>
                <strong>arXiv</strong>
                <small>MON / FRI</small>
              </div>
            </div>
            <div className="console-stats">
              <div>
                <span>PAPERS</span>
                <strong>{String(paperRecords.length).padStart(2, "0")}</strong>
              </div>
              <div>
                <span>REPORTS</span>
                <strong>{String(reports.length).padStart(2, "0")}</strong>
              </div>
              <div>
                <span>CATEGORIES</span>
                <strong>{paperCategories.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="section-index">01 / PAPER DAILY</span>
              <h2>最新论文日报</h2>
            </div>
            <Link className="text-link" href="/reports">
              浏览全部日报 <ArrowIcon />
            </Link>
          </div>
          <div className="latest-layout">
            <ReportCard report={latest} featured />
            <aside className="trend-panel">
              <span className="panel-label">THIS ISSUE / 本期内容</span>
              <blockquote>{latest.overview}</blockquote>
              <div className="trend-metrics">
                <div>
                  <strong>{latest.papers.length}</strong>
                  <span>精选论文</span>
                </div>
                <div>
                  <strong>3</strong>
                  <span>原文架构图</span>
                </div>
                <div>
                  <strong>{paperRecords.length}</strong>
                  <span>数据库收录</span>
                </div>
              </div>
              <div className="topic-cloud">
                {["VLA", "WAM", "Force Memory", "Dense Tokens", "Real Robot"].map((topic) => (
                  <span key={topic}>{topic}</span>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section section-muted">
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="section-index">02 / COMPANY TRACKER</span>
              <h2>机器人公司动向</h2>
            </div>
            <div className="weekly-badge">
              <span className="status-dot" />
              每周一更新
            </div>
          </div>
          <p className="section-intro">
            只跟踪官方博客、产品发布与开源仓库，区分模型、数据、硬件和规模化部署信号。
          </p>
          <div className="company-grid">
            {companyUpdates.map((update) => (
              <CompanyCard key={update.company} update={update} compact />
            ))}
          </div>
          <div className="section-cta">
            <Link className="button button-dark" href="/companies">
              查看完整追踪时间线 <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
