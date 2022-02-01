import React from 'react'
import { Box, Button, Flex, Link } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'

interface NavbarProps {}

export const Navbar: React.FC<NavbarProps> = () => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()
  const [{ data, fetching }] = useMeQuery()
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
        <Box mr={4}>{data?.me?.username}</Box>
        <Button variant="link" onClick={() => logout()} isLoading={logoutFetching}>
          logout
        </Button>
      </Flex>
    )
  }
  return (
    <Flex bg="tan" p={4}>
      <Box ml="auto">{!fetching && body}</Box>
    </Flex>
  )
}
