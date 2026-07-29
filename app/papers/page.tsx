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
          每期达到收录标准的论文都会进入数据库。可分别按研究方向、主要训练方式、
          创新模态、数据方法、机器人平台以及部署迁移方式组合检索；常规 RGB 与语言输入
          不作为模态标签。
        </p>
      </section>
      <section className="shell database-section">
        <PaperDatabase papers={paperRecords} initialCategory={category} />
      </section>
    </div>
  );
}
