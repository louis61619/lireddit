import { Box, Heading } from '@chakra-ui/react'
import { withUrqlClient } from 'next-urql'
import { useRouter } from 'next/router'
import React from 'react'
import { EditDelectPostButton } from '../../components/EditDelectPostButton'
import { Layout } from '../../components/Layout'
import { usePostQuery } from '../../generated/graphql'
import { createUrqlClient } from '../../utils/createUrqlClient'
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl'
import { withApollo } from '../../utils/withApollo'

interface PostProps {}

const Post: React.FC<PostProps> = () => {
  const [{ data, loading }] = useGetPostFromUrl()
  if (loading) {
    return (
      <Layout>
        <div>...loading</div>
      </Layout>
    )
  }
  if (!data?.post) {
    return (
      <Layout>
        <Box>could not find post</Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>

      <Box mb={4}>{data.post.text}</Box>
      <EditDelectPostButton post={data.post} />
    </Layout>
  )
}

export default withApollo({ ssr: true })(Post)
