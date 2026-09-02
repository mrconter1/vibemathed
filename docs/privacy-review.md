# Privacy review (GDPR), 2 September 2026

Issue #11. The operator is in Sweden and the site runs in Frankfurt (`fra1`),
so the GDPR applies in full. This is the inventory the issue asked for: what
is collected, why, how long it is kept, what a member can do about it, and
what is missing. It is an engineering review, not legal advice.

## What is stored, and why

| Data | Where | Why | Who sees it |
|---|---|---|---|
| Email, OAuth name, avatar URL | `User.email/name/image` | Sign-in via Google or GitHub (Auth.js adapter). Email is also the admin check (`ADMIN_EMAILS`). | Nobody by default. Name and email appear on the public profile only if the member turns the toggle on (`showGoogleName/Email`, both default off). |
| OAuth tokens (`access_token`, `refresh_token`, `id_token`) | `Account` | Written by the Auth.js adapter. **Not used by the site**: nothing calls a provider API after sign-in. | Nobody. |
| Sessions | `Session` | Database sessions, 30-day sliding window. | Nobody. |
| Pseudonym, bio, self-declared role, profile links | `User` | The public identity, all member-chosen. | Public. |
| Verified flag and note, staff role, citation count | `User` | Curator-set. | Public (badge, role chip, citation line). The verified note says what was checked; it must never contain an email or a private fact. |
| Comments, votes, edits | `Comment`, `ProblemVote`, `CommentVote`, `ProblemActivity` | The public record. Comments carry a pseudonym snapshot. | Public, under pseudonym. Activity rows for a comment are removed when it is deleted (fixed with issue #9). Votes are public in aggregate only; who voted is not shown. |
| Private mail | `DirectMessage` | Curator decisions, replies, member-started conversations. | Sender and recipient. |
| Contact-form messages, optional reply address | `SiteMessage` | Anyone can write to the curators, signed in or not. | Curators. |
| Reports | `ProblemReport` | Flagging an entry. | Curators. |
| Curator notes on submissions | `ReviewNote` | Internal review. | Curators. |
| Pending and rejected submissions | `Problem` with non-published status | Review. A rejection carries the curator's message. | Submitter (message) and curators. |
| Notification and inbox watermarks | `User.notificationsSeenAt/inboxSeenAt` | Unread counts. | Nobody. |
| Analytics | Vercel Analytics | Page views. Cookieless, aggregated, no IP retention on Vercel's stated model. | Operator, aggregated. |
| Browser storage | `localStorage` | List settings, comment sort, viewer snapshot, submission draft. Never leaves the browser. | The member's own browser. |

No IP addresses are logged by the application. No third-party trackers.
Server logs are Vercel's, with their retention.

## Lawful basis, as it stands

Everything here is either necessary to provide the account the member asked
for (contract) or the member's own public contribution to a record they chose
to join (legitimate interest plus their action). Nothing is used for a
secondary purpose; no data is sold or shared. The site does not process
special-category data.

## Retention

Nothing is deleted on a schedule. In practice:

- Accounts, comments, votes, messages: kept indefinitely.
- Sessions: expire after 30 days idle; expired rows are not purged.
- Rejected submissions: kept indefinitely, private.
- OAuth tokens: kept indefinitely, unused.

## What a member can do today

- See everything public about them on their profile.
- Change pseudonym, bio, role and links; choose whether name and email show;
  withdraw from the directory; hide their comment history from the profile.
- Delete any comment they wrote (content and changelog line both go).
- Sign out everywhere.
- Read every private message written to them in the inbox.

## What is missing

1. **A privacy page.** There is no `/privacy`. The table above is the content;
   it needs a public page saying it in plain words, linked from the footer
   and from the sign-in page. This is the one clear legal obligation on the
   list (Articles 13 and 14).
2. **Account deletion.** No self-serve way to delete an account, and no
   documented process. Article 17. What deletion should do is a decision,
   not just code: comments are part of a public record others replied to, so
   the honest shape is "delete the account, anonymise the contributions"
   (the pseudonym snapshot on comments and activity already exists for this
   reason), with private mail and sessions removed outright.
3. **Data export.** No self-serve export. Article 20. A JSON of the member's
   own rows is small work once deletion exists.
4. **OAuth tokens stored for no purpose.** The adapter writes them; the site
   never reads them. Minimisation says drop them: either strip the token
   fields in the adapter's `linkAccount` or null them on a schedule. Low
   effort, removes the most sensitive data the site holds.
5. **Expired sessions are never purged.** A weekly delete of
   `Session.expires < now()` is one line in `rektron-scheduled-jobs` or a
   Vercel cron.
6. **Retention statement for private mail and rejected submissions.** Decide
   and write down: kept while the account exists, deleted with it.
7. **Verified notes are public and free text.** The curator form should say
   not to put an email address in one; today's notes are fine.
8. **A processor list.** Vercel (hosting, analytics), CockroachDB Cloud
   (database, EU region), Google and GitHub (sign-in). Named on the privacy
   page.

## Suggested order

Privacy page first (obligation, half a day). Then token stripping and session
purge (small, real reduction in exposure). Then deletion, with the
anonymise-contributions decision made explicitly, and export alongside it.
