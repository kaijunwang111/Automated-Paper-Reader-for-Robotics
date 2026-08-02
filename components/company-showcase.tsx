"use client";

import { useEffect, useState } from "react";
import type { CompanyUpdate } from "@/lib/site-data";
import { CompanyCard } from "./content-cards";

function shuffledSample(updates: CompanyUpdate[], count: number) {
  const pool = [...updates];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
  }

  return pool.slice(0, Math.min(count, pool.length));
}

export function CompanyShowcase({
  updates,
  count,
}: {
  updates: CompanyUpdate[];
  count: number;
}) {
  const [featured, setFeatured] = useState(() => updates.slice(0, count));

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFeatured(shuffledSample(updates, count));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [count, updates]);

  return (
    <div className="company-grid">
      {featured.map((update) => (
        <CompanyCard key={update.company} update={update} compact />
      ))}
    </div>
  );
}
