import { IDatabaseDriver, Connection, MikroORM } from '@mikro-orm/core'

export type MyContext = MikroORM<IDatabaseDriver<Connection>>
