import DataLoader from 'dataloader'
import { Updoot } from '../entities/Updoot'

// [{ postId: 5, userId: 10 }]
// [{ postId: 5, userId: 10, value: 1 }, {}, {}]
// sql 相關的優化，不確定必要性
export const createUpdootLoader = () =>
  new DataLoader<{ postId: number; userId: number }, Updoot | null>(async (keys) => {
    const updoots = await Updoot.findByIds(keys as any)
    const UpdootIdsToUpdoot: Record<string, Updoot> = {}
    updoots.forEach((updoot) => {
      UpdootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot
    })

    return keys.map((key) => UpdootIdsToUpdoot[`${key.userId}|${key.postId}`])
  })
