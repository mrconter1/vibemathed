/** Canonical production origin. Change here if the domain ever moves. */
export const SITE_URL = "https://vibemathed.com";

/**
 * Whether this build is the real production deployment, as opposed to staging,
 * a pull-request preview, or a laptop.
 *
 * `VERCEL_ENV` is set by Vercel to `production`, `preview` or `development`,
 * and is the only one of the three that distinguishes staging from production:
 * `NODE_ENV` is `production` for any built deployment, staging included, so
 * using it here would leave staging indexable. Undefined off Vercel, which
 * correctly makes a local `next build` non-production too.
 *
 * Read at module scope on the server only. It gates crawling, not rendering,
 * so nothing here is sent to the client.
 */
export const IS_PRODUCTION_DEPLOY = process.env.VERCEL_ENV === "production";
