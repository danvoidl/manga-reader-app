import type { ApiModules } from '~/src/repository/api'
import { Manga } from '~/src/types/manga'
import { config } from '~/src/config'
import { GraphQLContext } from '~/src/middleware/auth'

interface CoverUrlArgs {
  size: number
}

interface ListArgs {
  limit?: number
}

interface OrderInput {
  field: string
  direction?: SortOrder
}

interface ExploreArgs {
  title?: string
  order?: OrderInput[]
  includedTags?: string[]
  limit?: number
}

type SortOrder = 'asc' | 'desc'

const DEFAULT_LIMIT = 96

type MangaRepo = ApiModules['manga']

/**
 * Request-scoped manga repository. The require-auth plugin (src/index.ts) rejects
 * unauthenticated operations first, so `context.modules` is always present here.
 */
function repo(context: GraphQLContext): MangaRepo {
  return context.modules!.manga
}

/** Fetch a manga list with a given sort order, returning [] on error. */
async function fetchMangas(
  manga: MangaRepo,
  order: Record<string, SortOrder>,
  limit = DEFAULT_LIMIT,
  includedTags: string[] = [],
  createdAtSince = ''
) {
  const [error, resp] = await manga.getManga(
    '',
    limit,
    order,
    includedTags,
    createdAtSince
  )

  if (error) return []

  return resp.data
}

/** Resolvers for manga lists, detail, categories, and cover URLs. */
export const mangaResolvers = {
  Query: {
    /** Most-followed manga (default home list). */
    mangas: async (parent: unknown, args: unknown, context: GraphQLContext) =>
      fetchMangas(repo(context), { followedCount: 'desc' }),
    /** Single manga detail by id. */
    manga: async (
      parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const [error, resp] = await repo(context).getMangaById(args.id)

      if (error) return null

      return resp.data
    },
    /** Newest manga by creation date. */
    recentlyAdded: async (
      parent: unknown,
      args: ListArgs,
      context: GraphQLContext
    ) => fetchMangas(repo(context), { createdAt: 'desc' }, args.limit),

    /** Manga ordered by rating. */
    highestRanking: async (
      parent: unknown,
      args: ListArgs,
      context: GraphQLContext
    ) => fetchMangas(repo(context), { rating: 'desc' }, args.limit),

    /** Recently added (last 30 days) ordered by rating — powers the home banner. */
    topRatedRecent: async (
      parent: unknown,
      args: ListArgs,
      context: GraphQLContext
    ) => {
      const createdAtSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 19)

      return fetchMangas(
        repo(context),
        { rating: 'desc' },
        args.limit,
        [],
        createdAtSince
      )
    },

    /** Most-followed manga filtered by tag/genre ids (home genre rows). */
    mangasByTag: async (
      parent: unknown,
      args: { includedTags: string[]; limit?: number },
      context: GraphQLContext
    ) =>
      fetchMangas(
        repo(context),
        { followedCount: 'desc' },
        args.limit,
        args.includedTags
      ),

    /** All available tags/genres (for the Explore filters). */
    categories: async (
      parent: unknown,
      args: unknown,
      context: GraphQLContext
    ) => {
      const [error, resp] = await repo(context).getTags()

      if (error) return []

      return resp.data
    },

    /**
     * Flexible Explore query: combines an optional title, multiple sort criteria
     * (order[<field>]=asc|desc) and included tag ids in a single call. Reuses
     * getManga, which already supports all four inputs.
     */
    exploreMangas: async (
      parent: unknown,
      args: ExploreArgs,
      context: GraphQLContext
    ) => {
      const title = args.title?.trim() ?? ''

      const order = (args.order ?? []).reduce<Record<string, SortOrder>>(
        (acc, o) => ({ ...acc, [o.field]: o.direction ?? 'desc' }),
        {}
      )

      // MangaDex only accepts order[relevance] alongside a title query — sending
      // it without one is rejected. Drop it when there's no search term.
      if (!title) delete order.relevance

      const finalOrder = Object.keys(order).length
        ? order
        : { followedCount: 'desc' as SortOrder }

      const [error, resp] = await repo(context).getManga(
        title,
        args.limit,
        finalOrder,
        args.includedTags ?? []
      )

      if (error) return []

      return resp.data
    }
  },
  Manga: {
    /** Keep only relationships that carry a fileName (i.e. cover_art). */
    relationships: (parent: Manga) => {
      return parent.relationships.filter(
        (rel) => rel.attributes && rel.attributes.fileName
      )
    },
    
    /**
     * Build the cover URL server-side from the cover_art relationship so the
     * client never has to assemble it. `size` picks the thumbnail variant
     * (e.g. 256/512); 0 returns the original.
     */
    coverUrl: (parent: Manga, args: CoverUrlArgs) => {
      const cover = parent.relationships.find(
        (rel) => rel.type === 'cover_art' && rel.attributes?.fileName
      )

      if (!cover) return null

      const { size } = args
      const suffix = size && size > 0 ? `.${size}.jpg` : ''

      return `${config.UPLOAD_BASE_URL}/covers/${parent.id}/${cover.attributes.fileName}${suffix}`
    }
  }
}
