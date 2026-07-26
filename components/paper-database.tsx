"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PaperCategory, PaperRecord } from "@/lib/site-data";
import { paperCategories } from "@/lib/site-data";
import { ArrowIcon } from "./site-shell";

export function PaperDatabase({
  papers,
  initialCategory = "",
}: {
  papers: PaperRecord[];
  initialCategory?: string;
}) {
  const normalizedInitialCategory = paperCategories.includes(initialCategory as PaperCategory)
    ? (initialCategory as PaperCategory)
    : "";
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PaperCategory | "">(normalizedInitialCategory);

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        paperCategories.map((item) => [
          item,
          papers.filter((paper) => paper.categories.includes(item)).length,
        ]),
      ) as Record<PaperCategory, number>,
    [papers],
  );

  const filteredPapers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return papers.filter((paper) => {
      const categoryMatches = !category || paper.categories.includes(category);
      const searchableText = [
        paper.title,
        paper.arxivId,
        paper.signal,
        ...paper.institutions,
        ...paper.tags,
        ...paper.categories,
      ]
        .join(" ")
        .toLocaleLowerCase();

      return categoryMatches && (!normalizedQuery || searchableText.includes(normalizedQuery));
    });
  }, [category, papers, query]);

  return (
    <div className="paper-database">
      <div className="database-controls">
        <label className="paper-search">
          <span>SEARCH</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索标题、arXiv ID、机构或技术标签"
          />
        </label>
        <div className="database-count" aria-live="polite">
          <strong>{filteredPapers.length}</strong>
          <span>篇精读论文</span>
        </div>
      </div>

      <div className="category-filters" aria-label="论文分类">
        <button
          className={!category ? "is-active" : ""}
          type="button"
          onClick={() => setCategory("")}
        >
          全部 <span>{papers.length}</span>
        </button>
        {paperCategories.map((item) => (
          <button
            className={category === item ? "is-active" : ""}
            key={item}
            type="button"
            onClick={() => setCategory(item)}
          >
            {item} <span>{categoryCounts[item]}</span>
          </button>
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
                  {[...new Set([...paper.categories, ...paper.tags])].map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="database-links">
                  <Link href={`/papers/${paper.arxivId}`}>
                    精读详情 <ArrowIcon />
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
          <p>可以清空搜索词或切换分类。</p>
        </div>
      )}
    </div>
  );
}
