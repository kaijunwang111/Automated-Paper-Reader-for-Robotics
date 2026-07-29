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
          <span className="analysis-label">02 / 方法结构</span>
          <p>{paper.architecture}</p>
        </section>
        <section>
          <span className="analysis-label">03 / 学习方式</span>
          <p>{paper.optimization}</p>
        </section>
        <section>
          <span className="analysis-label">04 / 数据组成</span>
          <p>{paper.data}</p>
        </section>
        <section>
          <span className="analysis-label">05 / 实验结论</span>
          <p>{paper.experiments}</p>
        </section>
        {paper.novelty ? (
          <section>
            <span className="analysis-label">06 / 相对已有工作</span>
            <p>{paper.novelty}</p>
          </section>
        ) : null}
      </div>

      <section className="paper-experiment-evidence">
        <div className="experiment-evidence-head">
          <div>
            <span className="section-kicker">EXPERIMENT EVIDENCE</span>
            <h3>实验依据</h3>
          </div>
          <p>只记录原文能够确认的设置、对照与结果；未报告的试验次数或误差范围不会补写。</p>
        </div>
        {paper.experimentDetails?.length ? (
          <div className="experiment-block-grid">
            {paper.experimentDetails.map((experiment) => (
              <article className="experiment-block" key={experiment.title}>
                <h4>{experiment.title}</h4>
                <dl className="experiment-block-meta">
                  <div>
                    <dt>设置</dt>
                    <dd>{experiment.setup}</dd>
                  </div>
                  <div>
                    <dt>对照</dt>
                    <dd>{experiment.comparisons}</dd>
                  </div>
                </dl>
                <ul className="experiment-results">
                  {experiment.results.map((result) => (
                    <li key={result}>{result}</li>
                  ))}
                </ul>
                {experiment.evidenceNote ? (
                  <p className="evidence-note">{experiment.evidenceNote}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <p className="experiment-fallback">{paper.experiments}</p>
        )}
      </section>

      <section className="repro-panel">
        <div className="repro-head">
          <div>
            <span className="section-kicker">REPRODUCIBILITY</span>
            <h3>复现线索</h3>
          </div>
          {paper.reproducibilityDetails ? (
            <span className={`repro-status repro-status-${paper.reproducibilityDetails.status}`}>
              {paper.reproducibilityDetails.status}
            </span>
          ) : null}
        </div>
        {paper.reproducibilityDetails ? (
          <div className="repro-grid">
            <div>
              <h4>已确认资源</h4>
              <ul>
                {paper.reproducibilityDetails.verifiedResources.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>实现线索</h4>
              <ul>
                {paper.reproducibilityDetails.implementation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4>仍缺少</h4>
              <ul>
                {paper.reproducibilityDetails.missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="repro-fallback">
            {paper.reproducibility ??
              "原文未提供足以组成复现清单的公开信息，请以论文附录和项目页为准。"}
          </p>
        )}
      </section>

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

      <section className="paper-deep-dive">
        <header className="deep-dive-header">
          <span className="section-kicker">DEEP DIVE</span>
          <h3>详细解读</h3>
          <p className="deep-dive-lead">
            {paper.deepDive?.lead ??
              paper.readingNotes ??
              "下面按方法机制、实验结果和可迁移启发继续展开。"}
          </p>
        </header>

        <div className="deep-dive-body">
          {(paper.deepDive?.sections ?? [
            {
              title: "方法是怎样工作的",
              paragraphs: [paper.architecture, paper.optimization],
            },
            {
              title: "数据与实验",
              paragraphs: [paper.data, paper.experiments],
            },
          ]).map((section) => (
            <section className="deep-dive-section" key={section.title}>
              <h4>{section.title}</h4>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          {paper.deepDive?.equations?.length ? (
            <section className="deep-dive-section">
              <h4>关键公式</h4>
              <div className="equation-stack">
                {paper.deepDive.equations.map((equation) => (
                  <article className="equation-card" key={equation.name}>
                    <span>{equation.name}</span>
                    <code>{equation.expression}</code>
                    <p>{equation.explanation}</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <div className="deep-dive-insights">
            <section>
              <h4>实验结果怎么读</h4>
              <ul>
                {(paper.deepDive?.experimentReading ?? [paper.experiments]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <section>
              <h4>进一步思考</h4>
              <ul>
                {(paper.deepDive?.reflections ?? [paper.transfer, paper.limitations]).map(
                  (item) => (
                    <li key={item}>{item}</li>
                  ),
                )}
              </ul>
            </section>
          </div>
        </div>
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
