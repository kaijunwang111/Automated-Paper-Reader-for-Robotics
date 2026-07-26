import Link from "next/link";
import { CompanyCard, ReportCard } from "@/components/content-cards";
import { ArrowIcon } from "@/components/site-shell";
import { companyUpdates, reports } from "@/lib/site-data";

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
              把每天涌现的机器人论文，
              <span>变成可执行的研究判断。</span>
            </h1>
            <p>
              聚焦具身智能、VLA、机器人学习与真机部署。我们拆解模型、数据和实验，
              也对过度包装的泛化结论保持警惕。
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href={`/reports/${latest.slug}`}>
                阅读最新日报 <ArrowIcon />
              </Link>
              <Link className="button button-secondary" href="/companies">
                查看公司动态
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
                <span>TOP</span>
                <strong>{latest.papers[0].score.toFixed(2)}</strong>
                <small>evidence score</small>
              </div>
            </div>
            <div className="console-stats">
              <div>
                <span>DATA SOURCE</span>
                <strong>arXiv</strong>
              </div>
              <div>
                <span>REPORTS</span>
                <strong>MON / FRI</strong>
              </div>
              <div>
                <span>PRIORITY</span>
                <strong>REAL ROBOT</strong>
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
              <span className="panel-label">THIS WEEK / 趋势判断</span>
              <blockquote>“{latest.trend}”</blockquote>
              <div className="trend-metrics">
                <div>
                  <strong>{latest.candidateCount}</strong>
                  <span>候选论文</span>
                </div>
                <div>
                  <strong>{latest.papers.length}</strong>
                  <span>PDF 精读</span>
                </div>
                <div>
                  <strong>3</strong>
                  <span>原文架构图</span>
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
              每周五更新
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

      <section className="manifesto">
        <div className="shell manifesto-inner">
          <span className="section-index">OUR FILTER</span>
          <h2>不是把摘要换一种说法。</h2>
          <div className="manifesto-grid">
            <div>
              <span>01</span>
              <h3>看证据</h3>
              <p>真机实验、任务复杂度、试验次数与消融质量共同决定实验分。</p>
            </div>
            <div>
              <span>02</span>
              <h3>拆结构</h3>
              <p>区分预训练、后训练与 RL，明确方法真正改变了哪一层。</p>
            </div>
            <div>
              <span>03</span>
              <h3>判断迁移</h3>
              <p>提取能够进入下一轮实验的模块，而不是只复述作者结论。</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
