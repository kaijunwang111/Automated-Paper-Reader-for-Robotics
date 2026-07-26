import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PaperDetail } from "@/components/paper-detail";
import { getPaperById, paperRecords } from "@/lib/site-data";

export function generateStaticParams() {
  return paperRecords.map((paper) => ({ arxivId: paper.arxivId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ arxivId: string }>;
}): Promise<Metadata> {
  const { arxivId } = await params;
  const paper = getPaperById(arxivId);

  return {
    title: paper?.title ?? "论文详情",
    description: paper?.signal,
  };
}

export default async function PaperPage({
  params,
}: {
  params: Promise<{ arxivId: string }>;
}) {
  const { arxivId } = await params;
  const paper = getPaperById(arxivId);

  if (!paper) {
    notFound();
  }

  return (
    <div className="page-shell paper-standalone-page">
      <div className="shell paper-standalone-nav">
        <Link href="/papers">← 返回论文数据库</Link>
        <Link href={`/reports/${paper.reportSlug}`}>查看收录日报：{paper.reportDate} ↗</Link>
      </div>
      <div className="shell paper-standalone-shell">
        <PaperDetail paper={paper} standalone />
      </div>
    </div>
  );
}
