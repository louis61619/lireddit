import { DeleteIcon } from '@chakra-ui/icons'
import { Box, Button, Flex, Heading, IconButton, Link, Stack, Text } from '@chakra-ui/react'
import { withUrqlClient } from 'next-urql'
import NextLink from 'next/link'
import { useState } from 'react'
import { Layout } from '../components/Layout'
import { UpdootSection } from '../components/UpdootSection'
import { useDeletePostMutation, usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

const Index = () => {
  const [variables, setVaribles] = useState({
    limit: 15,
    cursor: null as string | null,
  })
  const [{ data, fetching }] = usePostsQuery({
    variables,
  })
  const [, deletePost] = useDeletePostMutation()

  if (!fetching && !data) {
    return <div>you got query failed for some reason</div>
  }

  return (
    <Layout>
      <br />
      {data && !fetching ? (
        <Stack spacing={8}>
          {data.posts.posts.map((post) =>
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
                <Flex align="center">
                  <Text flex={1}>
                    <IconButton
                      onClick={() => {
                        if (!post.id) return
                        deletePost({ id: post.id })
                      }}
                      ml="auto"
                      icon={<DeleteIcon />}
                      aria-label="delete post"
                    ></IconButton>
                  </Text>
                </Flex>
              </Flex>
            ),
          )}
        </Stack>
      ) : (
        <div>...loading</div>
      )}
      <Flex>
        <Button
          onClick={() => {
            if (!data) {
              return
            }
            setVaribles({
              limit: variables.limit,
              cursor: data.posts.posts[data.posts.posts.length - 1].createAt,
            })
          }}
          m="auto"
          my={8}
        >
          load more
        </Button>
      </Flex>
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient)(Index)
