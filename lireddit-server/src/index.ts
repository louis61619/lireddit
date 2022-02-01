import 'reflect-metadata'
import express from 'express'
import Redis from 'ioredis'
import session from 'express-session'
import connectRedis from 'connect-redis'
import cors from 'cors'

import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { MikroORM } from '@mikro-orm/core'

import microConfig from './mikro-orm.config'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import { COOKIE_NAME, __prod__ } from './constants'

const main = async () => {
  const orm = await MikroORM.init(microConfig)

  // 初始化 schema
  // const generator = orm.getSchemaGenerator()
  // await generator.updateSchema()

  // 生成 sql 語句
  // const post = orm.em.create(Post, { title: 'my first Post' })
  // 調用
  // await orm.em.persistAndFlush(post)

  const app = express()

  app.use(
    cors({
      credentials: true,
      origin: [
        'https://studio.apollographql.com',
        'http://localhost:4000/graphql',
        'http://localhost:3000',
      ],
    }),
  )

  const RedisStore = connectRedis(session)
  const redis = new Redis()

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        // sameSite: 'lax', // csrf
        // sameSite: 'none', // use in graphql studio

        // secure: __prod__, // cookie only work in https
        sameSite: 'lax',
        secure: __prod__ ? true : 'auto',
      },
      saveUninitialized: false,
      secret: 'fqwwwwjrirofffll',
      resave: false,
    }),
  )
  !__prod__ && app.set('trust proxy', 1)

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({ em: orm.em, req, res }),
  })
  await apolloServer.start()

  apolloServer.applyMiddleware({
    app,
    cors: false,
  })

  app.listen(4000, () => {
    console.log('server is listen on 4000')
  })
}

main().catch((err) => {
  console.error(err)
})
