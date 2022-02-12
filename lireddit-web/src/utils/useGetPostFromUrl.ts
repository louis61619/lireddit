import { usePostQuery } from '../generated/graphql'
import { useGetIntId } from './useGetIntId'

export const useGetPostFromUrl = () => {
  const intId = useGetIntId()
  const { data, loading } = usePostQuery({
    skip: intId === -1,
    variables: {
      postId: intId,
    },
  })

  return [
    {
      data,
      loading,
    },
  ]
}
