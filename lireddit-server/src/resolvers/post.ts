import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from 'type-graphql'
import { getConnection } from 'typeorm'
import { Post } from '../entities/Post'
import { Updoot } from '../entities/Updoot'
import { isAuth } from '../middleware/isAuth'
import { MyContext } from '../types'

@InputType()
class PostInput {
  @Field()
  title: string

  @Field()
  text: string
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[]
  @Field()
  hasMore: boolean
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50)
  }

  @Mutation(() => Boolean)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext,
  ) {
    const { userId } = req.session
    const isUpdoot = value !== -1
    const realValue = isUpdoot ? 1 : -1

    const updoot = await Updoot.findOne({ where: { postId, userId } })

    // the user has voted on the post before
    // and they are change their vote
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          update updoot
          set value = $1
          where "postId" = $2 and "userId" = $3
        `,
          [realValue, postId, userId],
        )

        // vote 1 => vote -1
        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2
        `,
          [2 * realValue, postId],
        )
      })
    } else if (!updoot) {
      // has never voted before
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          insert into updoot ("userId", "postId", value)
          values ($1, $2, $3);
        `,
          [userId, postId, realValue],
        )
        await tm.query(
          `
          update post
          set points = points + $1
          where id = $2;
        `,
          [realValue, postId],
        )
      })
    }

    return true
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext,
  ): Promise<PaginatedPosts> {
    // return Post.find()
    const realLimit = Math.min(50, limit)
    const realLimitPlusOne = realLimit + 1
    const replacements: any[] = [realLimitPlusOne, req.session.userId]
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)))
    }

    const posts = await getConnection().query(
      `
      select p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createAt', u."createAt",
        'updateAt', u."updateAt"
      ) creator,
      ${
        req.session.userId
          ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"'
          : 'null as "voteStatus"'
      }
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createAt" < $3` : ''}
      order by p."createAt" DESC
      limit $1
    `,
      replacements,
    )

    // const qb = getConnection()
    //   .getRepository(Post)
    //   .createQueryBuilder('p')
    //   .innerJoinAndSelect('p.creator', 'u', 'u.id = p."creatorId"')
    //   .orderBy('p."createAt"', 'DESC')
    //   .take(realLimitPlusOne)

    // if (cursor) {
    //   qb.where('"createAt" < :cursor', { cursor: new Date(parseInt(cursor)) })
    // }

    // const posts = await qb.getMany()

    // 多找後面一個，如果存在就代表有多的
    return {
      posts: posts.slice(0, realLimit),
      hasMore: posts.length === realLimitPlusOne,
    }
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id', () => Int) id: number): Promise<Post | undefined> {
    return Post.findOne(id, { relations: ['creator'] })
  }

  @UseMiddleware(isAuth)
  @Mutation(() => Post)
  async createPost(@Arg('input') input: PostInput, @Ctx() { req }: MyContext): Promise<Post> {
    // const post = em.create(Post, { title })
    // await em.persistAndFlush(post)
    // 2 sql use typeORM create and insert
    return Post.create({
      ...input,
      creatorId: req.session.userId,
    }).save()
  }

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg('id', () => Int) id: number,
    @Arg('title') title: string,
    @Arg('text') text: string,
    @Ctx() { req }: MyContext,
  ): Promise<Post | null> {
    // 如果該 id 的 post 不存在則返回 null
    // const post = await Post.findOne(id)
    // if (!post) {
    //   return null
    // }
    // // 如果 title 存在則寫入
    // if (typeof title !== 'undefined') {
    //   post.title = title
    //   Post.update({ id }, { title, text })
    // }
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', { id, creatorId: req.session.userId })
      .returning('*')
      .execute()
    return result.raw[0]
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(@Arg('id', () => Int) id: number, @Ctx() { req }: MyContext): Promise<boolean> {
    // 找出關聯並刪除
    // const post = await Post.findOne(id)
    // if (!post) return false
    // if (post.creatorId !== req.session.userId) {
    //   throw new Error('not authorized')
    // }
    // await Updoot.delete({ postId: id })
    // await Post.delete({ id })
    await Post.delete({ id, creatorId: req.session.userId })
    return true
  }
}
