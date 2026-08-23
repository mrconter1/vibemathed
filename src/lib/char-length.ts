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
/// Iterating a string yields code points, which is what the column measures.
///
/// NFC first, because the same visible text can arrive in more than one
/// encoding and only one of them is cheap. Pasted from macOS, "Erdös" often
/// comes decomposed as o + combining diaeresis: six code points where the
/// precomposed spelling is five, for glyphs a reader cannot tell apart.
/// Normalizing costs the writer nothing and makes the count depend on what
/// the text looks like rather than where it was copied from. It also means
/// one visible string always stores as one byte sequence, so search and
/// duplicate detection cannot be fooled by the spelling.
///
/// NOT grapheme clusters, though those are what a person actually counts.
/// A combining sequence with no precomposed form - x-bar, v-vector, alpha-hat,
/// all ordinary in mathematics - stays two code points after NFC while being
/// one grapheme. Counting graphemes would therefore accept text the database
/// refuses: the columns are `STRING(n)` and n is measured in code points,
/// confirmed here by feeding 150 graphemes at 300 code points to a
/// `String(200)` column and watching it be rejected. Validating on a looser
/// unit than the column enforces turns a clean "too long" message into a
/// write that fails at the driver, which is a worse experience than the
/// occasional two-for-one character.
export function charLength(s: string): number {
  return [...s.normalize("NFC")].length;
}

/// The canonical form to store, so what was counted is what is written.
export function canonical(s: string): string {
  return s.normalize("NFC");
}
