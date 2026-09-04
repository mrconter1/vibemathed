// The community invite, in one place.
//
// It appears in the header and in contextual contribution prompts. Keeping the
// URL here prevents a rotated invite from going stale on one of those surfaces.
//
// NOTE for whoever rotates this: Discord invites expire after seven days by
// default. This one is set to expiry "Never", and any replacement must be
// too, or the site quietly starts linking to a dead invite and nobody notices
// until someone mentions it.
export const DISCORD_INVITE = "https://discord.gg/UGFA5xVT7y";

/// The account the site posts from, paired with Discord after the header's
/// primary navigation.
///
/// Deliberately a personal account rather than a project one: what this site
/// sells is editorial judgement - why a submission was rejected, what a Lean
/// repo actually proves - and that reads as a person, not a logo. If a
/// @vibemathed account ever takes over the posting, this is the one line that
/// changes.
export const X_PROFILE = "https://x.com/RasmusLindahl6";
