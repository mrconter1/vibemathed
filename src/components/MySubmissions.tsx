"use client";

// The reader's own entries that are still waiting for a curator, shown at the
// top of the inbox until the decision lands there as a message.
//
// This is the submitter's side of the review queue. The curator side has a
// pill in the header and a review page; the public side has /queue. Before
// this, the submitter had a success screen and then silence, and silence for
// a day was read as the entry being lost. Naming the wait, and saying how long
// it usually is, is the whole feature.
//
// Fetched on mount like the rest of the inbox, for the same reason: the
// action checks the session itself, and reading cookies during render would
// make the route dynamic.

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getMyPendingSubmissions,
  type MyPendingSubmission,
} from "@/app/actions/submit-problem";
import { RelativeTime } from "@/components/RelativeTime";
import { TeX } from "@/components/TeX";

export function MySubmissions() {
  const [items, setItems] = useState<MyPendingSubmission[] | null>(null);

  useEffect(() => {
    let alive = true;
    getMyPendingSubmissions()
      .then((rows) => {
        if (alive) setItems(rows);
      })
      .catch(() => {
        // A failed read renders nothing, same as an empty queue. The inbox
        // itself is the page; this block is a courtesy on top of it.
        if (alive) setItems([]);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label="Your submissions under review"
      className="mb-6 rounded-md border border-[var(--accent-orange)] bg-[color-mix(in_srgb,var(--accent-orange)_8%,transparent)] px-4 py-3"
    >
      <h2 className="text-sm font-medium text-[var(--ink)]">
        {items.length === 1
          ? "Your submission is under review"
          : `${items.length} of your submissions are under review`}
      </h2>
      <ul className="mt-2 space-y-1">
        {items.map((s) => (
          <li key={s.submittedAtIso} className="text-xs text-[var(--ink-secondary)]">
            <TeX>{s.name}</TeX>
            <span className="text-[var(--ink-muted)]">
              {s.fieldGroup ? ` · ${s.fieldGroup}` : ""}
              {" · submitted "}
              <RelativeTime iso={s.submittedAtIso} fallback={s.submittedAt} />
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs leading-relaxed text-[var(--ink-secondary)]">
        Most entries are reviewed within two days. The decision arrives here as a message,
        whichever way it goes. The public{" "}
        <Link href="/queue" className="text-[var(--accent-blue)] hover:underline">
          review queue
        </Link>{" "}
        shows everything that is waiting.
      </p>
    </section>
  );
}
