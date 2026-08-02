"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PaperRecord, TaxonomyDimension } from "@/lib/site-data";
import {
  getPaperClassificationLabels,
  paperTaxonomy,
} from "@/lib/site-data";
import { ArrowIcon } from "./site-shell";

const taxonomyEntries = Object.entries(paperTaxonomy) as [
  TaxonomyDimension,
  (typeof paperTaxonomy)[TaxonomyDimension],
][];

function valuesForDimension(paper: PaperRecord, dimension: TaxonomyDimension): string[] {
  switch (dimension) {
    case "research":
      return [paper.classification.research];
    case "training":
      return paper.classification.training ? [paper.classification.training] : [];
    case "modality":
      return [...(paper.classification.modalities ?? [])];
    case "data":
      return paper.classification.data ? [paper.classification.data] : [];
    case "platform":
      return [...(paper.classification.platforms ?? [])];
    case "deployment":
      return paper.classification.deployment ? [paper.classification.deployment] : [];
  }
}

function initialFilters(category: string) {
  const match = taxonomyEntries.find(([, group]) =>
    (group.values as readonly string[]).includes(category),
  );
  return match ? { [match[0]]: category } : {};
}

export function PaperDatabase({
  papers,
}: {
  papers: PaperRecord[];
}) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Partial<Record<TaxonomyDimension, string>>>({});

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const category = new URLSearchParams(window.location.search).get("category") ?? "";
      setFilters(initialFilters(category));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        taxonomyEntries.flatMap(([dimension, group]) =>
          group.values.map((value) => [
            `${dimension}:${value}`,
            papers.filter((paper) => valuesForDimension(paper, dimension).includes(value)).length,
          ]),
        ),
      ) as Record<string, number>,
    [papers],
  );

  const filteredPapers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return papers.filter((paper) => {
      const taxonomyMatches = Object.entries(filters).every(([dimension, value]) =>
        valuesForDimension(paper, dimension as TaxonomyDimension).includes(value),
      );
      const searchableText = [
        paper.title,
        paper.arxivId,
        paper.signal,
        ...paper.institutions,
        ...paper.tags,
        ...getPaperClassificationLabels(paper),
        paper.detailAttributes?.memoryImplementation,
        paper.detailAttributes?.memoryHorizon,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();

      return taxonomyMatches && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [filters, papers, query]);

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="paper-database">
      <div className="database-controls">
        <label className="paper-search">
          <span>SEARCH</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题、arXiv ID、机构、方法或详情属性"
          />
        </label>
        <div className="database-count" aria-live="polite">
          <strong>{filteredPapers.length}</strong>
          <span>篇收录论文</span>
        </div>
      </div>

      <div className="taxonomy-filter-toolbar">
        <p>不同维度之间为组合筛选；每个维度只选择论文的主要贡献。</p>
        {activeFilterCount ? (
          <button type="button" onClick={() => setFilters({})}>
            清除 {activeFilterCount} 个筛选
          </button>
        ) : null}
      </div>

      <div className="taxonomy-filter-groups" aria-label="论文分类筛选">
        {taxonomyEntries.map(([dimension, group]) => (
          <section className="taxonomy-filter-group" key={dimension}>
            <div>
              <span>{group.label}</span>
              {dimension === "modality" ? <small>只标注创新所在模态</small> : null}
            </div>
            <div className="category-filters">
              {group.values.map((value) => {
                const isActive = filters[dimension] === value;
                return (
                  <button
                    className={isActive ? "is-active" : ""}
                    key={value}
                    type="button"
                    onClick={() =>
                      setFilters((current) => {
                        const next = { ...current };
                        if (isActive) {
                          delete next[dimension];
                        } else {
                          next[dimension] = value;
                        }
                        return next;
                      })
                    }
                  >
                    {value} <span>{categoryCounts[`${dimension}:${value}`]}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {filteredPapers.length ? (
        <div className="database-results">
          {filteredPapers.map((paper) => (
            <article className="database-paper-card" key={paper.arxivId}>
              <div className="database-paper-meta">
                <span>{paper.reportDate}</span>
                <span>arXiv:{paper.arxivId}</span>
              </div>
              <h2>
                <Link href={`/papers/${paper.arxivId}`}>{paper.title}</Link>
              </h2>
              <p>{paper.signal}</p>
              <div className="database-institutions">{paper.institutions.join(" · ")}</div>
              <div className="database-card-bottom">
                <div className="tag-row">
                  {getPaperClassificationLabels(paper).map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="database-links">
                  <Link href={`/papers/${paper.arxivId}`}>
                    论文概览 <ArrowIcon />
                  </Link>
                  <a href={paper.url} target="_blank" rel="noreferrer">
                    arXiv <ArrowIcon />
                  </a>
                  {paper.resources?.map((resource) => (
                    <a key={resource.url} href={resource.url} target="_blank" rel="noreferrer">
                      {resource.label} <ArrowIcon />
                    </a>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="database-empty">
          <strong>暂无匹配论文</strong>
          <p>可以清空搜索词或减少组合筛选条件。</p>
        </div>
      )}
    </div>
  );
}
