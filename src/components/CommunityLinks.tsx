import { DISCORD_INVITE, X_PROFILE } from "@/lib/community";

const communityLink =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md " +
  "transition-opacity hover:opacity-70 focus:outline-none focus-visible:outline-2 " +
  "focus-visible:outline-offset-1 focus-visible:outline-[var(--accent-blue)]";

/// The site's two public community outposts, adjacent to the site sections but
/// visually independent from them. Both marks get the generous footprint of
/// the original production X link rather than sharing a labeled container.
export function CommunityLinks() {
  return (
    <span role="group" aria-label="Community" className="ml-1 flex shrink-0 items-center gap-0.5">
      <a
        href={DISCORD_INVITE}
        target="_blank"
        rel="noopener noreferrer"
        title="Join the community on Discord"
        aria-label="Join the community on Discord (opens in a new tab)"
        className={`${communityLink} text-[var(--brand-discord)]`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19.27 5.33A16.6 16.6 0 0 0 15.16 4c-.18.32-.39.75-.53 1.09a15.4 15.4 0 0 0-4.26 0C10.23 4.75 10.02 4.32 9.83 4a16.6 16.6 0 0 0-4.11 1.33C3.1 9.26 2.39 13.08 2.74 16.85a16.7 16.7 0 0 0 5.06 2.57c.41-.56.77-1.15 1.08-1.77-.59-.22-1.16-.5-1.69-.82.14-.1.28-.21.41-.32a11.9 11.9 0 0 0 10.2 0c.14.11.27.22.41.32-.54.32-1.11.6-1.7.82.31.62.67 1.21 1.08 1.77a16.6 16.6 0 0 0 5.06-2.57c.42-4.37-.72-8.16-2.38-11.52ZM9.16 14.55c-.99 0-1.8-.9-1.8-2.01 0-1.11.79-2.01 1.8-2.01 1.01 0 1.82.9 1.8 2.01 0 1.11-.8 2.01-1.8 2.01Zm5.68 0c-.99 0-1.8-.9-1.8-2.01 0-1.11.79-2.01 1.8-2.01 1.01 0 1.82.9 1.8 2.01 0 1.11-.79 2.01-1.8 2.01Z" />
        </svg>
      </a>
      <a
        href={X_PROFILE}
        target="_blank"
        rel="noopener noreferrer"
        title="Follow VibeMathed updates on X"
        aria-label="Follow VibeMathed updates on X (opens in a new tab)"
        className={`${communityLink} text-[var(--brand-x)]`}
      >
        <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden>
          <mask id="x-mark-knockout">
            <rect width="24" height="24" rx="5" fill="white" />
            <path
              transform="translate(12 12) scale(0.68) translate(-12 -12)"
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              fill="black"
            />
          </mask>
          <rect
            className="x-mark-solid"
            width="24"
            height="24"
            rx="5"
            fill="currentColor"
            mask="url(#x-mark-knockout)"
          />
          <g className="x-mark-hollow">
            <rect
              x="0.9"
              y="0.9"
              width="22.2"
              height="22.2"
              rx="4.4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
            />
            <path
              transform="translate(12 12) scale(0.55) translate(-12 -12)"
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              fill="currentColor"
            />
          </g>
        </svg>
      </a>
    </span>
  );
}
