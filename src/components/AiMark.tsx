// The per-field provenance marker (issue #6): a small "AI" chip beside a
// field's heading when a model drafted its current value, with model, date,
// source and reviewing curator on hover. Renders nothing when there is no
// record, and the AI-disclosure page explains that "no marker" means
// unrecorded rather than human-written for anything before 2 Sep 2026.

import { InfoTip } from "@/components/Tooltip";
import type { ProvenanceView } from "@/lib/provenance";

export function AiMark({ provenance }: { provenance: ProvenanceView | undefined }) {
  if (!provenance) return null;
  const detail = [
    `Drafted by ${provenance.model}, reviewed and saved by ${provenance.reviewedBy} on ${provenance.date}.`,
    provenance.source ? `Worked from: ${provenance.source}.` : null,
    "See the AI disclosure page for what this does and does not mean.",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <span
      className="inline-flex items-center gap-0.5 rounded-full border px-1.5 text-[10px] font-medium tracking-wide"
      style={{
        color: "var(--ink-muted)",
        borderColor: "color-mix(in srgb, var(--ink-muted) 45%, transparent)",
      }}
    >
      AI
      <InfoTip content={detail} label="AI-drafted field" />
    </span>
  );
}
