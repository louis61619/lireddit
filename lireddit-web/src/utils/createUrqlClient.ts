import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache'
import Router from 'next/router'
import { dedupExchange, Exchange, fetchExchange, gql, stringifyVariables } from 'urql'
import { pipe, tap } from 'wonka'

import {
  DeletePostMutation,
  DeletePostMutationVariables,
  LoginMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from '../generated/graphql'
import { betterUpdateQuery } from './betterUpdateQuery'
import { isServer } from './isServer'

const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    // console.log('error exchange was used')
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error?.message.includes('not authenticated')) {
          Router.replace('/login')
        }
      }),
    )
  }

export type MergeMode = 'before' | 'after'

export interface PaginationParams {
  offsetArgument?: string
  limitArgument?: string
  mergeMode?: MergeMode
}

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    // 進行緩存的更新
    const { parentKey: entityKey, fieldName } = info

    const allFields = cache.inspectFields(entityKey)
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName)
    const size = fieldInfos.length
    if (size === 0) {
      return undefined
    }

    const fieldKey = `Query.posts(${stringifyVariables(fieldArgs)})`
    const isItInTheCache = cache.resolve(fieldKey, 'posts')

    let hasMore = true
    const results: string[] = []
    info.partial = !isItInTheCache
    fieldInfos.forEach((fi) => {
      // console.log(entityKey, fi.fieldKey)
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string
      const data = cache.resolve(key, 'posts') as string[]
      // console.log(data)
      const _hasMore = cache.resolve(key, 'hasMore')
      if (!_hasMore) {
        hasMore = _hasMore as boolean
      }
      results.push(...data)
    })

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results,
    }
  }
}

function invalidateAllPost(cache: Cache) {
  const allFields = cache.inspectFields('Query')
  const fieldInfos = allFields.filter((info) => info.fieldName === 'posts')
  fieldInfos.forEach((fi) => {
    cache.invalidate('Query', 'posts', fi.arguments || {})
  })
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  // 先不做 ssr
  // console.log(ssrExchange, ctx)
  return {
    url: process.env.NEXT_PUBLIC_API_URL,
    fetchOptions: {
      credentials: 'include' as const,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (_result, args, cache) => {
              cache.invalidate({
                __typename: 'Post',
                id: (args as DeletePostMutationVariables).id,
              })
            },
            vote: (_result, args, cache) => {
              const { postId, value } = args as VoteMutationVariables
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId },
              )
              if (data) {
                if (data.voteStatus === value) {
                  return
                }
                const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value },
                )
              }
            },
            createPost: (_result, args, cache) => {
              invalidateAllPost(cache)
            },
            logout: (_result, args, cache) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null }),
              )
              invalidateAllPost(cache)
            },
            login: (_result, args, cache) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query
                  } else {
                    return {
                      me: result.login.user,
                    }
                  }
                },
              )
              invalidateAllPost(cache)
            },
            register: (_result, args, cache) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query
                  } else {
                    return {
                      me: result.register.user,
                    }
                  }
                },
              )
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  }
}
