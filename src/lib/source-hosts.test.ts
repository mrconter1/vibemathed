import { describe, expect, it } from "vitest";
import { SOURCE_HOSTS, SOURCE_HOST_KEYS, sourceHostKey } from "@/lib/source-hosts";

describe("sourceHostKey", () => {
  it("recognises arXiv in its common forms", () => {
    expect(sourceHostKey("https://arxiv.org/abs/2608.30238")).toBe("arxiv");
    expect(sourceHostKey("http://arxiv.org/abs/2608.30238")).toBe("arxiv");
    expect(sourceHostKey("https://www.arxiv.org/pdf/2608.30238v1")).toBe("arxiv");
    expect(sourceHostKey("https://export.arxiv.org/abs/2608.30238")).toBe("arxiv");
  });

  it("recognises the Erdős tracker", () => {
    expect(sourceHostKey("https://www.erdosproblems.com/4")).toBe("erdos");
  });

  it("buckets code hosts together", () => {
    expect(sourceHostKey("https://github.com/rwst/Pisot-Cantor-61/blob/main/paper.pdf")).toBe("repo");
    expect(sourceHostKey("https://gitlab.com/ai-village-agents/village/graffiti-verification")).toBe("repo");
  });

  it("sends everything else, including junk, to other", () => {
    expect(sourceHostKey("https://zenodo.org/records/1")).toBe("other");
    expect(sourceHostKey("https://x.com/someone/status/1")).toBe("other");
    expect(sourceHostKey("not a url")).toBe("other");
    expect(sourceHostKey("")).toBe("other");
  });

  it("keeps the option list and the key list in step", () => {
    expect(SOURCE_HOST_KEYS).toEqual(SOURCE_HOSTS.map((h) => h.key));
  });
});
