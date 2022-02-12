import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { useRouter } from 'next/router'
import React from 'react'
import { InputField } from '../../../components/InputField'
import { Layout } from '../../../components/Layout'
import { useUpdatePostMutation } from '../../../generated/graphql'
import { useGetIntId } from '../../../utils/useGetIntId'
import { useGetPostFromUrl } from '../../../utils/useGetPostFromUrl'
import { withApollo } from '../../../utils/withApollo'

interface EditPostProps {}

const EditPost: React.FC<EditPostProps> = () => {
  const intId = useGetIntId()
  const router = useRouter()
  const [{ data, loading }] = useGetPostFromUrl()
  // 更新後會連帶緩存一起更新，所以要保證返回的字段
  const [updatePost] = useUpdatePostMutation()
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
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          const { errors } = await updatePost({
            variables: {
              updatePostId: intId,
              ...values,
            },
          })
          if (!errors) {
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box minHeight="110px">
              <InputField name="title" placeholder="title" label="Title" />
            </Box>
            <Box minHeight="180px">
              <InputField textarea name="text" placeholder="text..." label="Body" />
            </Box>

            <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
              update post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}

export default withApollo({ ssr: false })(EditPost)
