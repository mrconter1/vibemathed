import type { MetadataRoute } from "next";
import { IS_PRODUCTION_DEPLOY, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Staging serves the same pages under a second hostname, so left as-is this
  // would invite crawlers to index a duplicate of the whole catalog and let it
  // compete with production in search results. Everything that is not the
  // production deployment refuses crawling outright.
  //
  // The canonical tags are a separate mechanism and deliberately still point at
  // SITE_URL, which is production: if a staging page is ever fetched or linked
  // anyway, the canonical sends the credit to the real one.
  if (!IS_PRODUCTION_DEPLOY) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
