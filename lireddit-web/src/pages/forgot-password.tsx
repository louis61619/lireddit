import { Box, Button } from '@chakra-ui/react'
import { Form, Formik } from 'formik'
import React, { useState } from 'react'
import { InputField } from '../components/InputField'
import { Wrapper } from '../components/Wrapper'
import { useForgotPasswordMutation } from '../generated/graphql'
import { withApollo } from '../utils/withApollo'

interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = () => {
  const [complete, setComplete] = useState(false)
  const [forgotPassword] = useForgotPasswordMutation()

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword({ variables: values })
          setComplete(true)
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>if an acconut with that email is exists, we sent the email</Box>
          ) : (
            <Form>
              <Box minHeight="110px">
                <InputField name="email" placeholder="email" label="Email" />
              </Box>
              <Button type="submit" colorScheme="teal" isLoading={isSubmitting}>
                forgot password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  )
}

export default withApollo({ ssr: false })(ForgotPassword)
