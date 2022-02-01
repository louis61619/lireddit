import { Arg, Ctx, Int, Mutation, Query, Resolver } from 'type-graphql'
import { MyContext } from '../types'
import { Post } from '../entities/Post'
import { sleep } from '../utils/sleep'

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    await sleep(1000)
    return em.find(Post, {})
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id })
  }

  @Mutation(() => Post)
  async createPost(@Arg('title') title: string, @Ctx() { em }: MyContext): Promise<Post> {
    const post = em.create(Post, { title })
    await em.persistAndFlush(post)
    return post
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
    @Ctx() { em }: MyContext,
  ): Promise<Post | null> {
    // 如果該 id 的 post 不存在則返回 null
    const post = await em.findOne(Post, { id })
    if (!post) {
      return null
    }
    // 如果 title 存在則寫入
    if (typeof title !== 'undefined') {
      post.title = title
      await em.persistAndFlush(post)
    }
    return post
  }

  @Mutation(() => Boolean)
  async delePost(@Arg('id', () => Int) id: number, @Ctx() { em }: MyContext): Promise<boolean> {
    await em.nativeDelete(Post, { id })
    return true
  }
}
