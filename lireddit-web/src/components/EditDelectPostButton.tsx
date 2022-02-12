import { EditIcon, DeleteIcon } from '@chakra-ui/icons'
import { Flex, IconButton } from '@chakra-ui/react'
import React from 'react'
import { PostSnippetFragment, useDeletePostMutation, useMeQuery } from '../generated/graphql'
import NextLink from 'next/link'

interface EditDelectPostButtonProps {
  // post: PostSnippetFragment
  post: Pick<PostSnippetFragment, 'creator' | 'id'>
}

export const EditDelectPostButton: React.FC<EditDelectPostButtonProps> = ({ post }) => {
  const { data: meData } = useMeQuery()
  const [deletePost] = useDeletePostMutation()
  return meData?.me?.id === post.creator.id ? (
    <Flex align="center">
      <NextLink href="/post/edit/[id]" as={`/post/edit/${post.id}`}>
        <IconButton mr={4} icon={<EditIcon />} aria-label="edit post"></IconButton>
      </NextLink>
      <IconButton
        onClick={() => {
          if (!post.id) return
          deletePost({
            variables: { id: post.id },
            update: (cache) => {
              // Post:number
              cache.evict({ id: 'Post:' + post.id })
            },
          })
        }}
        icon={<DeleteIcon />}
        aria-label="delete post"
      ></IconButton>
    </Flex>
  ) : null
}
