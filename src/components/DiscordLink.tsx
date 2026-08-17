// The Discord invite as a header icon button.
//
// Sits in the slot the theme toggle used to occupy. Theme is a set-once
// preference and belongs in the account menu (where GitHub, Reddit and
// YouTube all keep it); an invite is something a stranger should be able to
// notice, which is what a permanent header slot is actually good for.
//
// Rendered for everyone, signed in or out - unlike the mail and bell beside
// it, a community link is not an account feature.

import { DISCORD_INVITE } from "@/lib/community";
import { HEADER_ICON, HEADER_ICON_HOVER } from "@/lib/header-button";

export function DiscordLink() {
  return (
    <a
      href={DISCORD_INVITE}
      target="_blank"
      rel="noopener noreferrer"
      title="Join the community on Discord"
      aria-label="Join the community on Discord"
      className={`inline-flex ${HEADER_ICON} ${HEADER_ICON_HOVER}`}
    >
      {/* Discord's mark, drawn as a filled path in currentColor rather than
          their brand blurple: every other glyph in this row is monochrome and
          inherits the ink colour, and one branded colour among them reads as
          an advertisement rather than a control. */}
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19.27 5.33A16.6 16.6 0 0 0 15.16 4c-.18.32-.39.75-.53 1.09a15.4 15.4 0 0 0-4.26 0C10.23 4.75 10.02 4.32 9.83 4a16.6 16.6 0 0 0-4.11 1.33C3.1 9.26 2.39 13.08 2.74 16.85a16.7 16.7 0 0 0 5.06 2.57c.41-.56.77-1.15 1.08-1.77-.59-.22-1.16-.5-1.69-.82.14-.1.28-.21.41-.32a11.9 11.9 0 0 0 10.2 0c.14.11.27.22.41.32-.54.32-1.11.6-1.7.82.31.62.67 1.21 1.08 1.77a16.6 16.6 0 0 0 5.06-2.57c.42-4.37-.72-8.16-2.38-11.52ZM9.16 14.55c-.99 0-1.8-.9-1.8-2.01 0-1.11.79-2.01 1.8-2.01 1.01 0 1.82.9 1.8 2.01 0 1.11-.8 2.01-1.8 2.01Zm5.68 0c-.99 0-1.8-.9-1.8-2.01 0-1.11.79-2.01 1.8-2.01 1.01 0 1.82.9 1.8 2.01 0 1.11-.79 2.01-1.8 2.01Z" />
      </svg>
    </a>
  );
}
