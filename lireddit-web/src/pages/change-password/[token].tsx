import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { InputField } from '../../components/InputField'
import { Wrapper } from '../../components/Wrapper'
import { MeDocument, MeQuery, useChangePasswordMutation } from '../../generated/graphql'
import { toErrorMap } from '../../utils/toErrorMap'

interface ChangePasswordProps {
  token: string
}

const ChangePassword: NextPage<ChangePasswordProps> = () => {
  const [changePassword] = useChangePasswordMutation()
  const router = useRouter()
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            variables: {
              token: typeof router.query.token === 'string' ? router.query.token : '',
              newPassword: values.newPassword,
            },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.changePassword.user,
                },
              })
              cache.evict({ fieldName: 'posts:{}' })
            },
          })
          if (response.data?.changePassword.errors) {
            setErrors(toErrorMap(response.data.changePassword.errors))
          } else if (response.data?.changePassword.user) {
            router.push('/')
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Box minHeight="110px">
              <InputField
                name="newPassword"
                placeholder="new password"
                label="New password"
                type="password"
                autoComplete="off"
              />
            </Box>
            <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
              change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

// ChangePassword.getInitialProps = ({ query }) => {
//   return {
//     token: query.token as string,
//   }
// }

export default ChangePassword
