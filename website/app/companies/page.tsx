import type { Metadata } from "next";
import { CompanyDirectory } from "@/components/company-directory";
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
        <CompanyDirectory updates={companyUpdates} />
      </section>
    </div>
  );
}
