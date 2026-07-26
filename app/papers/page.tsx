import type { Metadata } from "next";
import { PaperDatabase } from "@/components/paper-database";
import { paperRecords } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "论文数据库",
  description: "按研究方向、标题、arXiv ID 与机构检索具身智能论文概览。",
};

export default async function PapersPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category = "" } = await searchParams;

  return (
    <div className="page-shell">
      <section className="page-hero shell paper-database-hero">
        <span className="section-index">PAPER DATABASE / INDEX</span>
        <h1>论文数据库</h1>
        <p>
          每期收录论文都会进入数据库。可按 VLA、WAM、WM、RL、Memory、Subtask、
          多模态、真机部署优化、Real2Sim2Real、Humanoid、数据增强、UMI / Ego 数据
          与其他方向分类检索。
        </p>
      </section>
      <section className="shell database-section">
        <PaperDatabase papers={paperRecords} initialCategory={category} />
      </section>
    </div>
  );
}
