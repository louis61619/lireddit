import React from 'react'
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useApolloClient } from '@apollo/client'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { isServer } from '../utils/isServer'

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const [logout, { loading: logoutFetching }] = useLogoutMutation()
  const apolloClient = useApolloClient()
  const { data, loading } = useMeQuery({
    // 判斷是否為 ssr
    // 這樣使用會導致網頁報錯
    // skip: isServer(),
  })

  let body = null
  if (!data?.me?.username) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={2}>login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link mr={2}>register</Link>
        </NextLink>
      </>
    )
  } else {
    body = (
      <Flex align="center">
        <Flex align="center">
          <NextLink href="/create-post">
            <Button mr={4}>create post</Button>
          </NextLink>
        </Flex>
        <Box mr={4}>{data?.me?.username}</Box>
        <Button
          variant="link"
          onClick={async () => {
            await logout()
            await apolloClient.resetStore()
          }}
          isLoading={logoutFetching}
        >
          logout
        </Button>
      </Flex>
    )
  }
  return (
    <Flex position="sticky" zIndex={1} top={0} bg="tan" p={4}>
      <Flex minW="800" align="center" m="auto">
        <NextLink href="/">
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>
        <Box ml="auto">{!loading && body}</Box>
      </Flex>
    </Flex>
  )
}
