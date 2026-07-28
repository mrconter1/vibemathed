import type { StatusIconKind } from "@/lib/display";

/// Small glyph paired with a verification label. Server-safe (no interactivity).
export function StatusIcon({ kind, color }: { kind: StatusIconKind; color: string }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: color,
    strokeWidth: 1.6,
  };

  if (kind === "check") {
    return (
      <svg {...common} aria-hidden>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M5.2 8.2l1.8 1.8 3.6-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "clock") {
    return (
      <svg {...common} aria-hidden>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.5V8l2.6 1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "info") {
    return (
      <svg {...common} aria-hidden>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 7.2v3.4" strokeLinecap="round" />
        <circle cx="8" cy="5.2" r="0.2" fill={color} />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden>
      <path d="M8 2.2l6.3 11.1H1.7L8 2.2z" strokeLinejoin="round" />
      <path d="M8 6.8v3" strokeLinecap="round" />
      <circle cx="8" cy="11.6" r="0.15" fill={color} />
    </svg>
  );
}
