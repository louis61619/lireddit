import { Cache, QueryInput } from '@urql/exchange-graphcache'

export function betterUpdateQuery<Result, Query>(
  chache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query,
) {
  return chache.updateQuery(qi, (data) => fn(result, data as any) as any)
}
