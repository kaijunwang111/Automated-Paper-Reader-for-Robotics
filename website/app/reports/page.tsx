import type { Metadata } from "next";
import { ReportCard } from "@/components/content-cards";
import { reports } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "论文日报",
  description: "具身智能、VLA 与机器人学习论文日报归档。",
};

export default function ReportsPage() {
  return (
    <div className="page-shell">
      <section className="page-hero shell">
        <span className="section-index">PAPER DAILY / ARCHIVE</span>
        <h1>论文日报</h1>
        <p>
          每周一与周五整理近期 arXiv 新论文，从动机、架构、训练阶段、数据、
          实验、亮点与局限等方面进行精读。
        </p>
      </section>
      <section className="shell archive-section">
        <div className="archive-toolbar">
          <span>{reports.length} 期日报</span>
          <div className="tag-row">
            <span>VLA</span>
            <span>Manipulation</span>
            <span>World Model</span>
            <span>Real Robot</span>
          </div>
        </div>
        <div className="report-archive-grid">
          {reports.map((report) => (
            <ReportCard key={report.slug} report={report} />
          ))}
        </div>
      </section>
    </div>
  );
}
