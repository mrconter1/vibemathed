/**
 * Guard for `generateStaticParams` against an empty database.
 *
 * Cache Components refuses to build a dynamic route whose
 * `generateStaticParams` returns nothing:
 *
 *   EmptyGenerateStaticParamsError: When using Cache Components, all
 *   `generateStaticParams` functions must return at least one result.
 *
 * That is a reasonable rule - it is how the build proves a route has no
 * unguarded dynamic access - but it makes every such route depend on the
 * database having rows in it, which a fresh one does not. It bites in exactly
 * the situations that matter most: a contributor building for the first time
 * before seeding, and a newly created staging database that has entries but no
 * members yet.
 *
 * The fallback prerenders one page for a slug that cannot exist, which the
 * route resolves to `notFound()` - a prerendered 404 and nothing worse. As soon
 * as there is real data the fallback is never used.
 *
 * Naming it here rather than repeating the ternary keeps the reason attached to
 * the workaround; a bare `?? [fake]` in two files reads like a mistake.
 */
export function withFallbackParam<K extends string>(
  rows: Record<K, string>[],
  key: K,
  fallback = "__none__",
): Record<K, string>[] {
  return rows.length > 0 ? rows : ([{ [key]: fallback }] as Record<K, string>[]);
}
