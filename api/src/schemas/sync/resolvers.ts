import { GraphQLContext } from '~/src/middleware/auth'
import { verifiedUserId } from '~/src/auth/verifyToken'
import { getBlob, putBlob, StoredBlob } from '~/src/db'

interface PushArgs {
  blob: string
  updatedAt: number
}

// The require-auth plugin (src/index.ts) already rejects tokenless operations,
// but here we re-verify the token's SIGNATURE to safely derive the blob owner's
// id (require-auth only checks presence, not validity).
export const syncResolvers = {
  Query: {
    /** Return the authenticated user's backup blob, or null if none. */
    async syncPull(
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ): Promise<StoredBlob | null> {
      const userId = await verifiedUserId(context.token)
      return getBlob(userId)
    }
  },
  Mutation: {
    /** Store the authenticated user's blob; returns the effective updatedAt. */
    async syncPush(
      _parent: unknown,
      { blob, updatedAt }: PushArgs,
      context: GraphQLContext
    ): Promise<number> {
      const userId = await verifiedUserId(context.token)
      return putBlob(userId, blob, updatedAt)
    }
  }
}
