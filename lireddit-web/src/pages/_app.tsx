import { ChakraProvider } from '@chakra-ui/react'
import { AppProps } from 'next/app'
// import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client'
import theme from '../theme'
// import { PaginatedPosts } from '../generated/graphql'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      {/* <ApolloProvider client={client}> */}
      <Component {...pageProps} />
      {/* </ApolloProvider> */}
    </ChakraProvider>
  )
}
export default MyApp
