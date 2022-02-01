import type { NextPage } from 'next'
// import { withUrqlClient } from 'next-urql'
import { ssrExchange, dedupExchange, cacheExchange, fetchExchange, useQuery } from 'urql'
import { withUrqlClient } from 'next-urql'

import { Navbar } from '../components/Navbar'
import { usePostsQuery } from '../generated/graphql'
import { createUrqlClient } from '../utils/createUrqlClient'

const Index = () => {
  const [{ data }] = usePostsQuery()

  // const data = result.data?.posts
  // console.log(data)

  return (
    <div>
      <Navbar></Navbar>
      {data ? (
        data.posts.map((post) => <div key={post.id}>{post.title}</div>)
      ) : (
        <div>...loading</div>
      )}
    </div>
  )
}

export default withUrqlClient(createUrqlClient)(Index)
