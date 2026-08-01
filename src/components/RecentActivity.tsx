// Site-wide activity feed for the home page: who did what, on which entry.
//
// A server component - the feed is public and identical for everyone, so it
// ships in the static shell rather than being fetched after hydration.

import Link from "next/link";
import type { SiteActivityView } from "@/lib/activity";
import { Icon } from "@/components/Icons";

function truncate(value: string | null, max = 60): string {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/// What the person did, with the entry name rendered as the link.
function describe(a: SiteActivityView) {
  const entry = (
    <Link
      href={`/problem/${a.problemSlug}`}
      className="font-medium text-[var(--ink)] hover:text-[var(--accent-blue)] hover:underline"
    >
      {a.problemName}
    </Link>
  );

  switch (a.type) {
    case "created":
      return <>added {entry}</>;
    case "submitted":
      return <>submitted {entry}</>;
    case "approved":
      return <>approved {entry}</>;
    case "commented":
      return <>commented on {entry}</>;
    case "updated": {
      const field = a.field ? a.field.toLowerCase() : "a field";
      const hadOld = a.oldValue !== null && a.oldValue.trim() !== "";
      const hasNew = a.newValue !== null && a.newValue.trim() !== "";
      if (!hadOld && hasNew) {
        return (
          <>
            set the {field} on {entry}
          </>
        );
      }
      if (hadOld && !hasNew) {
        return (
          <>
            cleared the {field} on {entry}
          </>
        );
      }
      return (
        <>
          changed the {field} on {entry} to{" "}
          <span className="text-[var(--ink-secondary)]">
            &ldquo;{truncate(a.newValue)}&rdquo;
          </span>
        </>
      );
    }
    default:
      return <>changed {entry}</>;
  }
}

export function RecentActivity({ activity }: { activity: SiteActivityView[] }) {
  if (activity.length === 0) return null;

  return (
    // Spans both rows of the overview grid on the right, and `h-full` makes it
    // match their combined height. Overflows scroll inside rather than
    // stretching the grid.
    <section
      className="order-last col-span-2 flex h-full flex-col overflow-hidden rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3.5 lg:order-none lg:row-span-2"
      aria-label="Latest activity"
    >
      <div className="shrink-0">
        <h2 className="flex items-center gap-2 font-serif text-base text-[var(--ink)]">
          <Icon name="pulse" size={14} className="text-[var(--ink-muted)]" />
          Latest activity
        </h2>
        <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
          Edits, submissions and discussion
        </p>
      </div>

      <ul className="mt-2.5 min-h-0 flex-1 overflow-y-auto">
        {activity.map((a) => (
          <li
            key={a.id}
            className="flex items-baseline gap-2 border-t border-[var(--hairline)] py-2 text-xs leading-relaxed first:border-t-0 first:pt-0"
          >
            {/* Description wraps inside flex-1; the date stays pinned right on
                the first line, so the dates read as a scannable column. */}
            {/* break-words: a quoted new value can be an unbreakable URL */}
            <span className="min-w-0 flex-1 break-words">
              {a.userPseudonym ? (
                <Link
                  href={`/user/${encodeURIComponent(a.userPseudonym)}`}
                  className="font-medium text-[var(--ink-secondary)] hover:text-[var(--accent-blue)] hover:underline"
                >
                  {a.userName}
                </Link>
              ) : (
                <span className="font-medium text-[var(--ink-secondary)]">
                  {a.userName}
                </span>
              )}{" "}
              <span className="text-[var(--ink-muted)]">{describe(a)}</span>
            </span>
            <span className="shrink-0 font-mono text-[11px] text-[var(--ink-muted)]">
              {a.createdAt}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
