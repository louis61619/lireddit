import { ApolloCache } from '@apollo/client'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { PostSnippetFragment, useVoteMutation, VoteMutation } from '../generated/graphql'

interface UpdootSectionProps {
  // posts: PostsQuery['posts']['posts'][0]
  post: PostSnippetFragment
}

const updateAfterVote = (value: number, postId: number, cache: ApolloCache<VoteMutation>) => {
  const data = cache.readFragment<{
    id: number
    points: number
    voteStatus: number | null
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  })

  if (data) {
    if (data.voteStatus === value) {
      return
    }
    const newPoints = (data.points as number) + (!data.voteStatus ? 1 : 2) * value
    cache.writeFragment({
      id: 'Post:' + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    })
  }
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loaddingState, setLoadingState] = useState<
    'downdoot-loading' | 'updoot-loading' | 'not-loading'
  >('not-loading')
  const [vote] = useVoteMutation()
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr="4">
      <IconButton
        onClick={async () => {
          setLoadingState('updoot-loading')
          await vote({
            variables: {
              postId: post.id,
              value: 1,
            },
            update: (cache) => {
              updateAfterVote(1, post.id, cache)
            },
          })
          setLoadingState('not-loading')
        }}
        colorScheme={post.voteStatus === 1 ? 'blackAlpha' : undefined}
        isLoading={loaddingState === 'updoot-loading'}
        icon={<ChevronUpIcon />}
        aria-label="updoot post"
      />
      {post.points}
      <IconButton
        onClick={async () => {
          setLoadingState('downdoot-loading')
          await vote({
            variables: {
              postId: post.id,
              value: -1,
            },
            update: (cache) => {
              updateAfterVote(-1, post.id, cache)
            },
          })
          setLoadingState('not-loading')
        }}
        colorScheme={post.voteStatus === -1 ? 'blackAlpha' : undefined}
        icon={<ChevronDownIcon />}
        isLoading={loaddingState === 'downdoot-loading'}
        aria-label="downdoot post"
      />
    </Flex>
  )
}
