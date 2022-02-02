import { IDatabaseDriver, Connection, EntityManager } from '@mikro-orm/core'
import { Request, Response } from 'express'
import { Session } from 'express-session'
import { Redis } from 'ioredis'

type SessionType = { userId: any } & Session

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
  req: Request & { session: SessionType }
  res: Response
  redis: Redis
}
