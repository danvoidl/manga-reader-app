import { makeExecutableSchema } from '@graphql-tools/schema'

import { mangaTypeDefs } from './mangas/schema'
import { mangaResolvers } from './mangas/resolvers'

import { mangaChaptersResolver } from './manga-chapters/resolvers'
import { mangaChaptersTypeDefs } from './manga-chapters/schema'

import { syncTypeDefs } from './sync/schema'
import { syncResolvers } from './sync/resolvers'

/** Executable schema assembled from the per-domain typeDefs + resolvers. */
export const schema = makeExecutableSchema({
  typeDefs: [mangaTypeDefs, mangaChaptersTypeDefs, syncTypeDefs],
  resolvers: [mangaResolvers, mangaChaptersResolver, syncResolvers]
})
