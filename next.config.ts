import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components turns on Partial Prerendering as the default in the App
  // Router: each route prerenders a static shell and streams the dynamic parts
  // in. That is what lets an entry page stay prerendered for SEO while its
  // live vote tally and the viewer's own vote arrive separately.
  // Enables the `use cache` directive plus `cacheLife` / `cacheTag`.
  cacheComponents: true,
};

export default nextConfig;
