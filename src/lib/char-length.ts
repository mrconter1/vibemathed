/// How long a piece of text is, in characters.
///
/// NOT `String.prototype.length`, which counts UTF-16 code units. The two
/// differ on every astral-plane character, and on a mathematics site those are
/// ordinary: blackboard bold, fraktur and script letters all live above
/// U+FFFF, so "Let 𝔽_q be a field" is 18 characters and 19 code units.
///
/// The gap is not cosmetic. Field limits were enforced with `.length`, so a
/// note the author had counted at 998 characters could be refused as over
/// 1000, and nothing on screen explained why. It also made the application
/// STRICTER than the column behind it: Postgres and CockroachDB size
/// `STRING(n)` in characters, so `.length` was rejecting text the database
/// would have stored happily.
///
/// Iterating a string yields code points, which is what a person counting
/// characters means and what the column measures.
export function charLength(s: string): number {
  return [...s].length;
}
