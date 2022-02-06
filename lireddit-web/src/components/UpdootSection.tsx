import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import React, { useState } from 'react'
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql'

interface UpdootSectionProps {
  // posts: PostsQuery['posts']['posts'][0]
  post: PostSnippetFragment
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loaddingState, setLoadingState] = useState<
    'downdoot-loading' | 'updoot-loading' | 'not-loading'
  >('not-loading')
  const [, vote] = useVoteMutation()
  return (
    <Flex direction="column" justifyContent="center" alignItems="center" mr="4">
      <IconButton
        onClick={async () => {
          setLoadingState('updoot-loading')
          await vote({
            postId: post.id,
            value: 1,
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
            postId: post.id,
            value: -1,
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
