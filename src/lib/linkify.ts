/// Turns bare URLs in ALREADY-ESCAPED text into anchors.
///
/// Shared by the comment renderer and by entry prose. Both escape their input
/// first and both emit raw HTML, so the safety argument is the same in each:
/// only absolute http(s) URLs match, so `javascript:` can never become an
/// href, and because the text was escaped before this runs, a quote inside a
/// URL is already `&quot;` and cannot break out of the attribute.

const URL_RE = /\bhttps?:\/\/[^\s<>"']+/g;

/// Trailing punctuation that is almost always sentence punctuation rather
/// than part of the URL. Kept outside the link so "see https://x.com/a." does
/// not produce a link with a full stop welded to the end.
const TRAILING_PUNCT_RE = /[.,;:!?)\]]+$/;

export function linkifyEscaped(escaped: string): string {
  return escaped.replace(URL_RE, (url) => {
    const match = url.match(TRAILING_PUNCT_RE);
    const tail = match ? match[0] : "";
    const href = tail ? url.slice(0, -tail.length) : url;
    return (
      `<a href="${href}" target="_blank" rel="nofollow noopener noreferrer"` +
      ` class="text-[var(--accent-blue)] hover:underline">${href}</a>${tail}`
    );
  });
}
