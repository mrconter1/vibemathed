"use server";

// Pre-fills the submission form from an arXiv identifier or URL (issue #5).
//
// Reads the arXiv API's Atom feed, never the HTML abstract page: the API is
// the supported interface and the page's markup changes. No dependencies -
// the feed is small and regular enough that a handful of regexes read it,
// and a parse failure returns an error rather than a wrong field.
//
// What it fills is deliberately narrow. The paper's title becomes a STARTING
// title for the entry, not the entry's name - an entry is named for the
// problem, not the paper, and the form says so. The abstract is returned for
// the submitter to read beside the form but is NOT written into Statement:
// that field is the problem as posed, and two abstracts pasted there in one
// night is what prompted the help text saying so. Authors, date and the
// canonical source URL are the fields transcription actually got wrong.

import { extractSourceId } from "@/lib/source-ids";

export interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  /// YYYY-MM-DD of the first version.
  published: string;
  abstract: string;
  primaryCategory: string | null;
  /// Canonical abs URL, versionless.
  url: string;
  /// Whether the abstract mentions a model - a hint for the AI-role field,
  /// never a value for it. The disclosure that counts is in the paper body.
  mentionsModel: boolean;
}

export type ArxivResult = { ok: true; paper: ArxivPaper } | { ok: false; error: string };

const ARXIV_ID = /^\d{4}\.\d{4,5}(v\d+)?$/;
const MODEL_WORDS =
  /\b(gpt|chatgpt|claude|gemini|llm|large language model|language model|codex|alphaproof|aristotle|copilot|lean)\b/i;

function text(xml: string, tag: string): string | null {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  return m ? decode(m[1]) : null;
}

function decode(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchArxiv(raw: string): Promise<ArxivResult> {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: "Paste an arXiv link or identifier." };

  // A URL in any of arXiv's shapes, or a bare id: extractSourceId already
  // knows both, and it is the same reading the duplicate check uses, so the
  // form and the check cannot disagree about what a paste points at.
  const found = extractSourceId(trimmed);
  const id = found?.startsWith("arxiv:") ? found.slice("arxiv:".length).replace(/v\d+$/, "") : null;
  if (!id || !ARXIV_ID.test(id)) {
    return { ok: false, error: "That does not look like an arXiv link or identifier (e.g. 2608.30238)." };
  }

  let xml: string;
  try {
    const res = await fetch(`https://export.arxiv.org/api/query?id_list=${encodeURIComponent(id)}`, {
      headers: { "User-Agent": "vibemathed.com submit-form (contact via site)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { ok: false, error: `arXiv answered ${res.status}. Try again in a moment.` };
    xml = await res.text();
  } catch {
    return { ok: false, error: "Could not reach arXiv. Fill the fields by hand or try again." };
  }

  const entry = xml.match(/<entry>([\s\S]*?)<\/entry>/)?.[1];
  const title = entry ? text(entry, "title") : null;
  // arXiv returns an <entry> with an "Error" title for an unknown id.
  if (!entry || !title || /^Error$/i.test(title) || /incorrect id/i.test(entry)) {
    return { ok: false, error: `arXiv has no paper ${id}.` };
  }

  const authors = [...entry.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)].map((m) => decode(m[1]));
  const published = (text(entry, "published") ?? "").slice(0, 10);
  const abstract = text(entry, "summary") ?? "";
  const primaryCategory = entry.match(/<arxiv:primary_category[^>]*term="([^"]+)"/)?.[1] ?? null;

  return {
    ok: true,
    paper: {
      id,
      title,
      authors,
      published,
      abstract,
      primaryCategory,
      url: `https://arxiv.org/abs/${id}`,
      mentionsModel: MODEL_WORDS.test(abstract),
    },
  };
}
