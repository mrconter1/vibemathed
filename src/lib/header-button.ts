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
export const HEADER_ICON =
  "h-7 w-7 shrink-0 items-center justify-center rounded-md border " +
  "border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-secondary)] " +
  "sm:h-8 sm:w-8";

/// The hover treatment, separate because the pre-hydration shells are inert
/// placeholders and must not appear interactive.
export const HEADER_ICON_HOVER =
  "transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]";
