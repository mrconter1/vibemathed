/// Shared geometry and skin for the header's icon buttons: submit, mail,
/// bell, theme, and the account shell.
///
/// One string because the same long class list was pasted into six places and
/// had already drifted once: the theme toggle shipped a size larger than its
/// neighbours because it was copied from the account avatar rather than from
/// the buttons it sits between.
///
/// Smaller below `sm`. Five 32px buttons plus the wordmark overflow a 360px
/// phone, and when they overflow the flex row wraps them onto a line of their
/// own, which is what turned the mobile header into three stacked rows with
/// the buttons stranded on the middle one.
///
/// Display is left to the caller: most want `inline-flex`, but the signed-in
/// shells take `viewer-in`, which supplies `display: flex` from CSS so the
/// right variant can be chosen before hydration.
/// The focus ring answers the keyboard only. Clicking or tapping one of these
/// leaves the button focused, and the UA's default ring then sits on it until
/// something else is clicked, which reads as a stuck toggle - especially on
/// the theme button, where the thing you just pressed is also the thing whose
/// state you are trying to read. `focus-visible` is the same rule the entry
/// cards already use, and the site's other buttons already draw their ring
/// this way.
const FOCUS =
  "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 " +
  "focus-visible:outline-[var(--accent-blue)]";

/// Geometry and surface, with no glyph colour. Split out because the Discord
/// link paints its glyph blurple: two `text-[...]` utilities have equal
/// specificity, so which one won would come down to Tailwind's output order
/// rather than the order they are written in, which is not something to build
/// on. A caller that wants its own ink takes this and supplies it.
export const HEADER_ICON_SHELL =
  "h-7 w-7 shrink-0 items-center justify-center rounded-md border " +
  "border-[var(--hairline)] bg-[var(--paper-raised)] " +
  "sm:h-8 sm:w-8 " +
  FOCUS;

export const HEADER_ICON = `${HEADER_ICON_SHELL} text-[var(--ink-secondary)]`;

/// The hover treatment, separate because the pre-hydration shells are inert
/// placeholders and must not appear interactive.
export const HEADER_ICON_HOVER =
  "transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]";
