import type { Paper } from "./site-data";

export type DailyEntry = Omit<Paper, "rank" | "figures" | "optimization" | "experimentDetails" | "reproducibilityDetails" | "deepDive"> & {
  figureFile: string; figureAlt: string; figureCaption: string;
  technique: string[]; evaluation: string[]; comparison: string;
  implementation: string[]; missing?: string[];
};

export function formatDaily(entries: DailyEntry[], date: string): Paper[] {
  return entries.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    optimization: entry.technique.join("；"),
    experimentDetails: [{ title: "实验与消融", setup: entry.experiments, comparisons: entry.comparison, results: entry.evaluation }],
    reproducibilityDetails: {
      status: "部分可复现",
      verifiedResources: entry.resources?.map((item) => `${item.label}: ${item.url}`) ?? [entry.url],
      implementation: entry.implementation,
      missing: entry.missing ?? [],
    },
    deepDive: {
      lead: entry.methodSummary ?? entry.signal,
      sections: [{ title: "技术细节", paragraphs: entry.technique }],
      experimentReading: entry.evaluation,
      reflections: [],
    },
    figures: [{ src: `/report-assets/${date}/${entry.figureFile}`, alt: entry.figureAlt, caption: entry.figureCaption }],
  }));
}
