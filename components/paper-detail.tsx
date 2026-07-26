import Link from "next/link";
import type { Paper } from "@/lib/site-data";
import { ArrowIcon } from "./site-shell";

export function PaperDetail({
  paper,
  id,
  standalone = false,
}: {
  paper: Paper;
  id?: string;
  standalone?: boolean;
}) {
  const TitleTag = standalone ? "h1" : "h2";

  return (
    <article
      className={`paper-detail ${standalone ? "paper-detail-standalone" : ""}`}
      id={id}
    >
      <div className="paper-detail-heading">
        <div>
          <span className="paper-detail-rank">
            {standalone ? `ARXIV / ${paper.arxivId}` : `SELECTED / 0${paper.rank}`}
          </span>
          <TitleTag>{paper.title}</TitleTag>
          <div className="institution-list">
            {paper.institutions.map((institution) => (
              <span key={institution}>{institution}</span>
            ))}
          </div>
          <div className="paper-category-row">
            {paper.categories.map((category) => (
              <Link key={category} href={`/papers?category=${encodeURIComponent(category)}`}>
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {paper.figure ? (
        <figure className="method-figure">
          <div className="figure-frame">
            <img src={paper.figure.src} alt={paper.figure.alt} />
          </div>
          <figcaption>
            <span>{paper.figure.caption}</span>
            <a href={paper.url} target="_blank" rel="noreferrer">
              原论文 <ArrowIcon />
            </a>
          </figcaption>
        </figure>
      ) : null}

      <div className="paper-analysis-grid">
        <section>
          <span className="analysis-label">01 / 出发点</span>
          <p>{paper.motivation}</p>
        </section>
        <section>
          <span className="analysis-label">02 / 模型结构</span>
          <p>{paper.architecture}</p>
        </section>
        <section>
          <span className="analysis-label">03 / 优化阶段</span>
          <p>{paper.optimization}</p>
        </section>
        <section>
          <span className="analysis-label">04 / 数据组成</span>
          <p>{paper.data}</p>
        </section>
        <section className="analysis-wide">
          <span className="analysis-label">05 / 实验内容与结果</span>
          <p>{paper.experiments}</p>
        </section>
      </div>

      <div className="judgement-grid">
        <section className="judgement-card judgement-positive">
          <span>亮点</span>
          <p>{paper.strengths}</p>
        </section>
        <section className="judgement-card judgement-caution">
          <span>局限</span>
          <p>{paper.limitations}</p>
        </section>
        <section className="judgement-card judgement-transfer">
          <span>可借鉴点</span>
          <p>{paper.transfer}</p>
        </section>
      </div>

      <div className="paper-resource-links">
        <a href={paper.url} target="_blank" rel="noreferrer">
          arXiv 原文 <ArrowIcon />
        </a>
        {paper.resources?.map((resource) => (
          <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer">
            {resource.label} <ArrowIcon />
          </a>
        ))}
      </div>
    </article>
  );
}
