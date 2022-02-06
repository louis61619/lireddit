import React, { InputHTMLAttributes } from 'react'
import { FormControl, FormLabel, Input, FormErrorMessage, Textarea } from '@chakra-ui/react'
import { useField } from 'formik'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  placeholder: string
  name: string
  textarea?: boolean
}

export const InputField: React.FC<InputFieldProps> = ({ label, size: _, textarea, ...props }) => {
  const [field, { error }] = useField(props)

  let TextareaOrInput: any = Input
  if (textarea) {
    TextareaOrInput = Textarea
  }

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor="name">{label}</FormLabel>
      <TextareaOrInput {...field} {...props} id={field.name} placeholder={props.placeholder} />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  )
}
