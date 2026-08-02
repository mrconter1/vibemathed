// The fixed set of links a member may put on their profile.
//
// Discrete, named fields rather than a free "add a link" list. Two reasons:
// a known set can be validated per kind, so a mistyped ORCID or a random URL
// in the arXiv slot is caught rather than published, and a fixed set gives a
// public page no open surface for link spam.
//
// These do double duty. They let a reader weigh a comment, and they are
// exactly the evidence the verification flow asks for - an arXiv author page
// or a university profile linking back IS the proof of identity.

export const LINK_KEYS = ["website", "arxiv", "orcid", "github", "linkedin"] as const;

export type LinkKey = (typeof LINK_KEYS)[number];

export interface LinkSpec {
  label: string;
  placeholder: string;
  /// Hosts the URL must end with, or null to allow any http(s) URL. Keeps a
  /// LinkedIn URL out of the arXiv field, which is the common paste error.
  hosts: string[] | null;
}

export const LINK_SPECS: Record<LinkKey, LinkSpec> = {
  website: {
    label: "Website",
    placeholder: "https://example.com",
    hosts: null,
  },
  arxiv: {
    label: "arXiv",
    placeholder: "https://arxiv.org/a/lastname_f_1",
    hosts: ["arxiv.org"],
  },
  orcid: {
    label: "ORCID",
    placeholder: "0000-0001-2345-6789",
    hosts: ["orcid.org"],
  },
  github: {
    label: "GitHub",
    placeholder: "https://github.com/username",
    hosts: ["github.com"],
  },
  linkedin: {
    label: "LinkedIn",
    placeholder: "https://www.linkedin.com/in/username",
    hosts: ["linkedin.com"],
  },
};

export type ProfileLinks = Partial<Record<LinkKey, string | null>>;

const ORCID_ID = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i;

export type LinkCheck = { ok: true; value: string | null } | { ok: false; error: string };

/// Validates and normalizes one link. Empty clears the field. A bare ORCID
/// identifier is accepted and expanded, because that is how people quote it.
export function normalizeLink(key: LinkKey, raw: string): LinkCheck {
  const value = raw.trim();
  if (value === "") return { ok: true, value: null };

  const spec = LINK_SPECS[key];

  if (key === "orcid" && ORCID_ID.test(value)) {
    return { ok: true, value: `https://orcid.org/${value.toUpperCase()}` };
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return {
      ok: false,
      error:
        key === "orcid"
          ? "ORCID must be a full URL or an identifier like 0000-0001-2345-6789."
          : `${spec.label} must be a full URL starting with https://.`,
    };
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return { ok: false, error: `${spec.label} must be an http or https URL.` };
  }

  if (spec.hosts) {
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    const allowed = spec.hosts.some((h) => host === h || host.endsWith(`.${h}`));
    if (!allowed) {
      return {
        ok: false,
        error: `${spec.label} should be a ${spec.hosts[0]} link.`,
      };
    }
  }

  if (url.href.length > 300) {
    return { ok: false, error: `${spec.label} link is too long.` };
  }

  return { ok: true, value: url.href };
}

/// What to show as the link text: the identifying part, not the whole URL.
export function linkDisplay(key: LinkKey, url: string): string {
  try {
    const u = new URL(url);
    if (key === "website") return u.hostname.replace(/^www\./, "");
    if (key === "orcid") return u.pathname.replace(/^\//, "") || "ORCID";
    const tail = u.pathname.split("/").filter(Boolean).pop();
    return tail ?? LINK_SPECS[key].label;
  } catch {
    return LINK_SPECS[key].label;
  }
}
