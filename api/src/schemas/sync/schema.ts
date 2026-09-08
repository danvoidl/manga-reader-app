export const syncTypeDefs = `#graphql
  "Per-user backup of the app's local stores (bookshelf, progress, overrides)."
  type SyncPayload {
    "Serialized JSON blob (the app runs JSON.parse). Opaque to the server."
    blob: String!
    "Last-write-wins watermark (epoch ms)."
    updatedAt: Float!
  }

  extend type Query {
    "The authenticated user's backup, or null if they haven't synced yet."
    syncPull: SyncPayload
  }

  type Mutation {
    "Store the authenticated user's backup (upsert, last-write-wins). Returns the effective updatedAt."
    syncPush(blob: String!, updatedAt: Float!): Float!
  }
`
