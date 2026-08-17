// The community invite, in one place.
//
// It appears in the header, the footer and the post-submission confirmation,
// and an invite that has to be changed in three files is an invite that ends
// up stale in one of them.
//
// NOTE for whoever rotates this: Discord invites expire after seven days by
// default. This one must be created with expiry "Never" and max uses
// "No limit", or the site quietly starts linking to a dead invite and nobody
// notices until someone mentions it.
export const DISCORD_INVITE = "https://discord.gg/wBGm4BQjN";
