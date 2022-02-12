import { Request, Response } from 'express'
import { Session } from 'express-session'
import { Redis } from 'ioredis'
import { createUpdootLoader } from './utils/createUpdootLoader'
import { createUserLoader } from './utils/createUserLoader'

type SessionType = { userId: any } & Session

export type MyContext = {
  // em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
  req: Request & { session: SessionType }
  res: Response
  redis: Redis
  userLoader: ReturnType<typeof createUserLoader>
  updootLoader: ReturnType<typeof createUpdootLoader>
}
