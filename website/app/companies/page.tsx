import type { Metadata } from "next";
import { CompanyCard } from "@/components/content-cards";
import { companyTrackerLastChecked, companyUpdates } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "公司动态",
  description: "具身智能公司在模型、数据、硬件、开源与部署方面的官方动态追踪。",
};

export default function CompaniesPage() {
  return (
    <div className="page-shell company-page">
      <section className="page-hero shell">
        <span className="section-index">COMPANY TRACKER / OFFICIAL SIGNALS</span>
        <h1>机器人公司动向</h1>
        <p>
          每周一检查官方博客、产品发布与开源仓库。这里关注的不是热度，
          而是模型能力、数据建设、硬件平台与规模化部署是否真的向前移动。
        </p>
        <div className="tracker-status">
          <span className="live-dot" />
          最近检查：{companyTrackerLastChecked} · 下次更新：周一
        </div>
      </section>

      <section className="shell tracker-section">
        <div className="tracker-legend">
          <span>TRACKING {String(companyUpdates.length).padStart(2, "0")} COMPANIES</span>
          <div>
            <span>模型</span>
            <span>数据</span>
            <span>硬件</span>
            <span>开源</span>
            <span>部署</span>
          </div>
        </div>
        <div className="company-timeline">
          {companyUpdates.map((update, index) => (
            <div className="timeline-item" key={update.company}>
              <div className="timeline-index">{String(index + 1).padStart(2, "0")}</div>
              <CompanyCard update={update} />
            </div>
          ))}
        </div>
      </section>

      <section className="shell source-policy">
        <div>
          <span className="section-index">SOURCE POLICY</span>
          <h2>官方信号优先</h2>
        </div>
        <div className="source-policy-copy">
          <p>
            首版只收录公司官网、官方技术博客与官方 GitHub。新闻稿中的性能数字会被标记为公司口径，
            不自动等价于独立验证结果。
          </p>
          <p>
            来源抓取失败时保留上次成功内容并显示更新时间，避免空数据被误读为“本周没有动态”。
          </p>
        </div>
      </section>
    </div>
  );
}
