import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { EditDelectPostButton } from '../components/EditDelectPostButton'
import { Layout } from '../components/Layout'
import { UpdootSection } from '../components/UpdootSection'
import { usePostsQuery } from '../generated/graphql'
import { withApollo } from '../utils/withApollo'

const Index = () => {
  const {
    data,
    error,
    loading: fetching,
    fetchMore,
    variables,
  } = usePostsQuery({
    variables: {
      limit: 15,
      cursor: null as string | null,
    },
    notifyOnNetworkStatusChange: true,
  })

  if (!fetching && !data) {
    return (
      <div>
        you got query failed for some reason
        <div>{error?.message}</div>
      </div>
    )
  }

  return (
    <Layout>
      <br />
      {!data && fetching ? (
        <div>...loading</div>
      ) : (
        <Stack spacing={8}>
          {data?.posts.posts.map((post) =>
            !post ? null : (
              <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
                <UpdootSection post={post} />
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${post.id}`}>
                    <Link>
                      <Heading fontSize="xl">{post.title}</Heading>
                    </Link>
                  </NextLink>

                  <Text>post by {post.creator.username}</Text>
                  <Text mt={4}>{post.textSnippet}</Text>
                </Box>
                <EditDelectPostButton post={post} />
              </Flex>
            ),
          )}
        </Stack>
      )}
      {data?.posts.posts && (
        <Flex>
          <Button
            onClick={() => {
              if (!data || !variables) {
                return
              }
              fetchMore({
                variables: {
                  limit: variables.limit,
                  cursor: data.posts.posts[data.posts.posts.length - 1].createAt,
                },
                // updateQuery: (previousValue, { fetchMoreResult }): PostsQuery => {
                //   if (!fetchMoreResult) {
                //     return previousValue as PostsQuery
                //   }

                //   return {
                //     __typename: 'Query',
                //     posts: {
                //       __typename: 'PaginatedPosts',
                //       hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
                //       posts: [
                //         ...(previousValue as PostsQuery).posts.posts,
                //         ...(fetchMoreResult as PostsQuery).posts.posts,
                //       ],
                //     },
                //   }
                // },
              })
            }}
            isLoading={fetching}
            m="auto"
            my={8}
          >
            load more
          </Button>
        </Flex>
      )}
    </Layout>
  )
}

export default withApollo({ ssr: true })(Index)
