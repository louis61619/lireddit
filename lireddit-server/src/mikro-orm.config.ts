import path from 'path'

import { Options } from '@mikro-orm/core'
import { Post } from './entities/Post'
import { __prod__ } from './constants'

const bob: Options = {
  user: 'louis',
  // 初始化表格
  migrations: {
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post],
  dbName: 'lireddit',
  type: 'postgresql',
  debug: !__prod__,
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
