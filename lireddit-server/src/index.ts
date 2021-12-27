import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { MikroORM } from '@mikro-orm/core'

import microConfig from './mikro-orm.config'
import { Post } from './entities/Post'
import express from 'express'

import { HelloResolver } from './resolvers/hello'

const main = async () => {
  const orm = await MikroORM.init(microConfig)
  await orm.getMigrator().up()
  // const post = orm.em.create(Post, { title: 'my first Post' })
  // await orm.em.persistAndFlush(post)

  // const posts = await orm.em.find(Post, {})
  // console.log(posts)

  const app = express()

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    }),
  })
  await apolloServer.start()

  apolloServer.applyMiddleware({ app })

  app.listen(4000, () => {
    console.log('server is listen on 4000')
  })
}

main().catch((err) => {
  console.error(err)
})

// function aaa() {
//   console.log('---')
// }
