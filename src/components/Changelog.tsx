import type { ActivityView } from "@/lib/activity";
import { RelativeTime } from "@/components/RelativeTime";

// Entry changelog. A server component using a native <details>, so it collapses
// without JavaScript and its contents are still in the HTML for crawlers.
//
// Since entries moved out of problems.json and into the database, git no longer
// records curation changes - this is the replacement audit trail.

function truncate(value: string | null, max = 90): string {
  if (!value) return "";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function Quoted({ children }: { children: string }) {
  return <span className="text-[var(--ink)]">&ldquo;{children}&rdquo;</span>;
}

function describe(a: ActivityView) {
  switch (a.type) {
    case "created":
      return <>added this entry</>;
    case "submitted":
      return <>submitted this entry</>;
    case "approved":
      return <>approved this entry</>;
    case "commented":
      return <>commented</>;
    case "updated": {
      const field = a.field ?? "a field";
      const hadOld = a.oldValue !== null && a.oldValue.trim() !== "";
      const hasNew = a.newValue !== null && a.newValue.trim() !== "";
      // On the entry's own changelog the other fields are NAMED rather than
      // counted. The reader is already here and wants to know what moved; a
      // bare "and 9 others" would make them open the diff to find out.
      const others = a.alsoFields?.length
        ? `, also ${a.alsoFields.join(", ")}`
        : "";
      if (!hadOld && hasNew) {
        return (
          <>
            set {field} to <Quoted>{truncate(a.newValue)}</Quoted>
            {others}
          </>
        );
      }
      if (hadOld && !hasNew) {
        return (
          <>
            cleared {field}
            {others}
          </>
        );
      }
      return (
        <>
          changed {field} from <Quoted>{truncate(a.oldValue)}</Quoted> to{" "}
          <Quoted>{truncate(a.newValue)}</Quoted>
          {others}
        </>
      );
    }
    default:
      return <>made a change</>;
  }
}

export function Changelog({ activity }: { activity: ActivityView[] }) {
  if (activity.length === 0) return null;

  return (
    <details className="mt-10 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3">
      {/* select-none on the toggle only - a double-click to spam it open and
          shut would otherwise select "Changelog" or the count next to it.
          The list below is a sibling, outside this element, so it keeps
          normal text selection. */}
      <summary className="cursor-pointer select-none text-sm text-[var(--ink-secondary)] transition-colors hover:text-[var(--ink)]">
        Changelog
        <span className="ml-2 text-xs text-[var(--ink-muted)]">
          {activity.length} {activity.length === 1 ? "change" : "changes"}
        </span>
      </summary>

      <ul className="mt-3 border-t border-[var(--hairline)] pt-3">
        {activity.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-t border-[var(--hairline)] py-2 text-xs leading-relaxed first:border-t-0 first:pt-0"
          >
            <span className="font-medium text-[var(--ink)]">{a.userName}</span>
            {/* break-words: quoted old/new values can be unbreakable URLs */}
            <span className="min-w-0 flex-1 break-words text-[var(--ink-secondary)]">
              {describe(a)}
            </span>
            <span className="shrink-0 font-mono text-[11px] text-[var(--ink-muted)]">
              <RelativeTime iso={a.createdAtIso} fallback={a.createdAt} />
            </span>
          </li>
        ))}
      </ul>
    </details>
  );
}
