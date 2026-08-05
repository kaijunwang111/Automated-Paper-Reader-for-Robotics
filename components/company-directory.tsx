"use client";

import { useMemo, useState } from "react";
import type { CompanyUpdate } from "@/lib/site-data";
import { CompanyCard } from "./content-cards";

type CompanySortMode = "date" | "alphabetical";

const companyNameCollator = new Intl.Collator("zh-CN-u-co-pinyin", {
  numeric: true,
  sensitivity: "base",
});

function compareStableName(left: string, right: string) {
  if (left === right) return 0;
  return left < right ? -1 : 1;
}

function sortCompanies(updates: CompanyUpdate[], mode: CompanySortMode) {
  return [...updates].sort((left, right) => {
    if (mode === "alphabetical") {
      return (
        companyNameCollator.compare(left.company, right.company) ||
        right.date.localeCompare(left.date)
      );
    }

    return (
      right.date.localeCompare(left.date) ||
      compareStableName(left.company, right.company)
    );
  });
}

export function CompanyDirectory({ updates }: { updates: CompanyUpdate[] }) {
  const [sortMode, setSortMode] = useState<CompanySortMode>("date");
  const sortedUpdates = useMemo(
    () => sortCompanies(updates, sortMode),
    [sortMode, updates],
  );

  return (
    <>
      <div className="tracker-legend">
        <div className="tracker-count">
          <span>TRACKING {String(updates.length).padStart(2, "0")} COMPANIES</span>
          <small aria-live="polite">
            {sortMode === "date" ? "最近更新优先" : "公司名称首字母 A–Z"}
          </small>
        </div>
        <div className="company-sorter" role="group" aria-label="公司排序方式">
          <span className="company-sort-label">SORT BY</span>
          <button
            className={sortMode === "date" ? "is-active" : ""}
            type="button"
            aria-pressed={sortMode === "date"}
            onClick={() => setSortMode("date")}
          >
            最近更新
          </button>
          <button
            className={sortMode === "alphabetical" ? "is-active" : ""}
            type="button"
            aria-pressed={sortMode === "alphabetical"}
            onClick={() => setSortMode("alphabetical")}
          >
            首字母 A–Z
          </button>
        </div>
      </div>
      <div className="company-timeline" data-sort-mode={sortMode}>
        {sortedUpdates.map((update, index) => (
          <div
            className="timeline-item"
            data-company-date={update.date}
            data-company-name={update.company}
            key={update.company}
          >
            <div className="timeline-index">{String(index + 1).padStart(2, "0")}</div>
            <CompanyCard update={update} />
          </div>
        ))}
      </div>
    </>
  );
}
