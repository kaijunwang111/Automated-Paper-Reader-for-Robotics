import Link from "next/link";
import type { Paper } from "@/lib/site-data";
import { getPaperClassificationLabels } from "@/lib/site-data";
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
            {standalone ? `ARXIV / ${paper.arxivId}` : `PAPER / ${String(paper.rank).padStart(2, "0")}`}
          </span>
          <TitleTag>{paper.title}</TitleTag>
          <div className="institution-list">
            {paper.institutions.map((institution) => (
              <span key={institution}>{institution}</span>
            ))}
          </div>
          <div className="paper-category-row">
            {getPaperClassificationLabels(paper).map((category) => (
              <Link key={category} href={`/papers?category=${encodeURIComponent(category)}`}>
                {category}
              </Link>
            ))}
          </div>
          <div className="paper-technical-tags" aria-label="技术细节">
            {paper.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          {paper.detailAttributes ? (
            <dl className="paper-detail-attributes">
              {paper.detailAttributes.memoryImplementation ? (
                <div>
                  <dt>Memory 实现</dt>
                  <dd>{paper.detailAttributes.memoryImplementation}</dd>
                </div>
              ) : null}
              {paper.detailAttributes.memoryHorizon ? (
                <div>
                  <dt>Memory 时间跨度</dt>
                  <dd>{paper.detailAttributes.memoryHorizon}</dd>
                </div>
              ) : null}
            </dl>
          ) : null}
        </div>
      </div>

      <div
        className={`method-figures ${
          paper.figures.length === 1 ? "method-figures-single" : ""
        }`}
      >
        {paper.figures.map((figure) => (
          <figure className="method-figure" key={figure.src}>
            <div className="figure-frame">
              <img src={figure.src} alt={figure.alt} loading="lazy" />
            </div>
            <figcaption>
              <span>{figure.caption}</span>
              <a href={paper.url} target="_blank" rel="noreferrer">
                原论文 <ArrowIcon />
              </a>
            </figcaption>
          </figure>
        ))}
      </div>

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
          <span className="analysis-label">03 / 训练与优化</span>
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
        {paper.novelty ? (
          <section>
            <span className="analysis-label">06 / 相对已有工作</span>
            <p>{paper.novelty}</p>
          </section>
        ) : null}
        {paper.reproducibility ? (
          <section>
            <span className="analysis-label">07 / 复现信息</span>
            <p>{paper.reproducibility}</p>
          </section>
        ) : null}
      </div>

      {paper.readingNotes ? (
        <section className="paper-reading-notes">
          <span className="analysis-label">METHOD & RESULTS / 原文解读</span>
          <p>{paper.readingNotes}</p>
        </section>
      ) : null}

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
