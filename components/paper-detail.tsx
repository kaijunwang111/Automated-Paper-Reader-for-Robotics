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
  const technicalSections =
    paper.deepDive?.sections.filter(
      (section) => !section.title.includes("实验") && !section.title.includes("结果"),
    ) ?? [];

  return (
    <article
      className={`paper-detail ${standalone ? "paper-detail-standalone" : ""}`}
      id={id}
    >
      <div className="paper-detail-heading">
        <div>
          <span className="paper-detail-rank">
            {standalone
              ? `ARXIV / ${paper.arxivId}`
              : `PAPER / ${String(paper.rank).padStart(2, "0")}`}
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
          <span className="analysis-label">02 / 方法</span>
          <p>{paper.methodSummary ?? paper.optimization}</p>
        </section>
        <section>
          <span className="analysis-label">03 / 模型结构</span>
          <p>{paper.architecture}</p>
        </section>
        <section>
          <span className="analysis-label">04 / 数据组成</span>
          <p>{paper.data}</p>
        </section>
        <section>
          <span className="analysis-label">05 / 实验内容和结论</span>
          <p>{paper.experiments}</p>
        </section>
        <section>
          <span className="analysis-label">06 / 相比 baseline 的改进点</span>
          <p>{paper.novelty ?? "原文未提供足够明确的直接 baseline 对照。"}</p>
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

      <section className="paper-detailed-content">
        <header className="detailed-content-header">
          <span className="section-kicker">DETAILED READING</span>
          <h3>详细内容</h3>
        </header>

        <section className="detailed-section">
          <h4>技术细节</h4>
          {technicalSections.length ? (
            technicalSections.map((section) => (
              <div className="technical-subsection" key={section.title}>
                <h5>{section.title}</h5>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ))
          ) : (
            <div className="technical-subsection">
              <p>{paper.architecture}</p>
              <p>{paper.optimization}</p>
            </div>
          )}

          {paper.deepDive?.equations?.length ? (
            <div className="formula-list">
              {paper.deepDive.equations.map((equation) => (
                <div className="formula-item" key={equation.name}>
                  <h5>{equation.name}</h5>
                  <div className="formula-expression">{equation.expression}</div>
                  <p>{equation.explanation}</p>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <section className="detailed-section">
          <h4>实验和消融测试</h4>
          {paper.experimentDetails?.length ? (
            paper.experimentDetails.map((experiment) => (
              <div className="experiment-prose" key={experiment.title}>
                <h5>{experiment.title}</h5>
                <p>
                  <strong>实验设置：</strong>
                  {experiment.setup}
                </p>
                <p>
                  <strong>对比方法：</strong>
                  {experiment.comparisons}
                </p>
                <ul>
                  {experiment.results.map((result) => (
                    <li key={result}>{result}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <p>{paper.experiments}</p>
          )}
        </section>

        <section className="detailed-section">
          <h4>可复现性</h4>
          {paper.reproducibilityDetails ? (
            <div className="reproducibility-prose">
              <p>
                <strong>网络结构与实现设置：</strong>
                {paper.reproducibilityDetails.implementation.join("；")}
              </p>
              <p>
                <strong>代码、模型与数据：</strong>
                {paper.reproducibilityDetails.verifiedResources.join("；")}
              </p>
              <p>
                <strong>原文尚未披露：</strong>
                {paper.reproducibilityDetails.missing.join("；")}
              </p>
            </div>
          ) : (
            <p>
              {paper.reproducibility ??
                "原文未披露足够的网络实现、训练超参数或公开资源信息。"}
            </p>
          )}
        </section>
      </section>

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
