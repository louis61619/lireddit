import { Options } from '@mikro-orm/core'
import { Post } from './entities/Post'
import { __prod__ } from './constants'
import { User } from './entities/User'

const bob: Options = {
  user: 'postgres',
  // 初始化表格
  migrations: {
    // path: path.join(__dirname, './'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post, User],
  dbName: 'lireddit',
  type: 'postgresql',
  debug: !__prod__,
  password: '123456',
}

export default bob

// export default {
//   entities: [Post],
//   dbName: 'lireddit',
//   type: 'postgresql',
//   debug: !__prod__,
// } as Parameters<typeof MikroORM.init>[0]

// export default {
//   entities: [Post],
//   dbName: 'lireddit',
//   type: 'postgresql',
//   debug: !__prod__,
// } as const
