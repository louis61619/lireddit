import 'reflect-metadata'
import 'dotenv-safe/config'

import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
import Redis from 'ioredis'
import path from 'path'

import { buildSchema } from 'type-graphql'
import { createConnection } from 'typeorm'
import { COOKIE_NAME, __prod__ } from './constants'
import { Post } from './entities/Post'
import { Updoot } from './entities/Updoot'
import { User } from './entities/User'
import { HelloResolver } from './resolvers/hello'
import { PostResolver } from './resolvers/post'
import { UserResolver } from './resolvers/user'
import { createUpdootLoader } from './utils/createUpdootLoader'
import { createUserLoader } from './utils/createUserLoader'

const main = async () => {
  // use typeorm
  await createConnection({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    logging: true,
    // 創建模擬資料，開發用
    // synchronize: true,
    migrations: [path.resolve(__dirname, './migrations/*')],
    entities: [Post, User, Updoot],
  })
  // 調用遷移資料
  // await conn.runMigrations()

  // const orm = await MikroORM.init(microConfig)
  // await orm.em.nativeDelete(User, {})

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
      origin: ['https://studio.apollographql.com', process.env.CORS_ORIGIN],
    }),
  )

  const RedisStore = connectRedis(session)
  const redis = new Redis(process.env.REDIS_URL)

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
        // domain: // only use in this domain
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET,
      resave: false,
    }),
  )
  !__prod__ && app.set('trust proxy', 1)

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      userLoader: createUserLoader(),
      updootLoader: createUpdootLoader(),
    }),
  })
  await apolloServer.start()

  apolloServer.applyMiddleware({
    app,
    cors: false,
  })

  app.listen(process.env.PORT, () => {
    console.log(`server is listen on ${process.env.PORT}`)
  })
}

main().catch((err) => {
  console.error(err)
})
