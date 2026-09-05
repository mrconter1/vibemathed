import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components turns on Partial Prerendering as the default in the App
  // Router: each route prerenders a static shell and streams the dynamic parts
  // in. That is what lets an entry page stay prerendered for SEO while its
  // live vote tally and the viewer's own vote arrive separately.
  // Enables the `use cache` directive plus `cacheLife` / `cacheTag`.
  cacheComponents: true,

  // The feature shipped to staging as "Records" for a day before it was
  // renamed to "Frontiers". Nothing was on production under the old paths, so
  // these exist only so a link someone already has in a Discord message or a
  // browser tab lands somewhere. Permanent, because the old names are not
  // coming back.
  async redirects() {
    return [
      { source: "/records", destination: "/frontiers", permanent: true },
      { source: "/record/:slug", destination: "/frontier/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
