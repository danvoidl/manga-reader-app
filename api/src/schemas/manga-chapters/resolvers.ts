import { RelationshipAttributes } from '~/src/types/manga-chapter'
import { Manga } from '~/src/types/manga'
import { dedupeByBestLanguage, LANG_PRIORITY, mangaRelId } from './utils'
import { GraphQLContext } from '~/src/middleware/auth'

/**
 * Request-scoped manga repository. The require-auth plugin (src/index.ts) rejects
 * unauthenticated operations first, so `context.modules` is always present here.
 */
function repo(context: GraphQLContext) {
  return context.modules!.manga
}

interface QueryArgs {
  mangaId: string
  chapterId: string
  limit: number
  offset: number
  order: 'asc' | 'desc'
}

interface LatestChaptersArgs {
  limit: number
}

/** Resolvers for chapter lists, the reader's pages, and the global feed. */
export const mangaChaptersResolver = {
  Query: {
    /** Paginated chapter list for one manga, deduped to the best language. */
    chapters: async (
      parent: unknown,
      args: QueryArgs,
      context: GraphQLContext
    ) => {
      const limit = args.limit ?? 10
      const offset = args.offset ?? 0
      const order = args.order ?? 'desc'

      const [error, resp] = await repo(context).getMangaChapters(
        args.mangaId,
        LANG_PRIORITY
      )

      if (error) return { items: [], total: 0, limit, offset }

      // dedupeByBestLanguage returns the list descending (latest first);
      // reverse it for ascending (first chapter to latest) before slicing.
      const deduped = dedupeByBestLanguage(resp.data)
      const ordered = order === 'asc' ? [...deduped].reverse() : deduped

      return {
        items: ordered.slice(offset, offset + limit),
        total: deduped.length,
        limit,
        offset
      }
    },

    /** Previous/next chapter around a given one, for reader navigation. */
    adjacentChapters: async (
      parent: unknown,
      args: QueryArgs,
      context: GraphQLContext
    ) => {
      const [error, resp] = await repo(context).getMangaChapters(
        args.mangaId,
        LANG_PRIORITY
      )

      if (error) return { next: null, prev: null }

      // Deduped list is sorted by chapter number descending (latest first),
      // so the next chapter to read sits at a lower index.
      const deduped = dedupeByBestLanguage(resp.data)
      const i = deduped.findIndex((chapter) => chapter.id === args.chapterId)

      if (i === -1) return { next: null, prev: null }

      return {
        next: deduped[i - 1] ?? null,
        prev: deduped[i + 1] ?? null
      }
    },

    /** Full-size page image URLs for a chapter (from the at-home server). */
    chapterImgs: async (
      parent: unknown,
      args: QueryArgs,
      context: GraphQLContext
    ) => {
      const [error, resp] = await repo(context).getMangaChapterImgs(
        args.chapterId
      )

      if (error) return []

      const data = resp.chapter.data.map(
        (img) => `${resp.baseUrl}/data/${resp.chapter.hash}/${img}`
      )

      return data
    },

    /** Single chapter by id (used to resolve external-publisher URLs). */
    chapter: async (
      parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const [error, resp] = await repo(context).getChapterById(args.id)

      if (error) return null

      return resp.data
    },

    /**
     * Global "Latest Updates" feed: one card per chapter (not deduped), each
     * carrying its manga. The chapter's manga relationship has no cover, so we
     * batch-fetch the manga by id (with cover_art) and attach the real node —
     * the Manga.coverUrl field resolver then builds the URL.
     */
    latestChapters: async (
      parent: unknown,
      args: LatestChaptersArgs,
      context: GraphQLContext
    ) => {
      const [error, resp] = await repo(context).getLatestChapters(args.limit)

      if (error) return []

      const chapters = resp.data

      const mangaIds = [
        ...new Set(
          chapters
            .map((chapter) => mangaRelId(chapter))
            .filter((id): id is string => Boolean(id))
        )
      ]

      const [mangaError, mangaResp] =
        await repo(context).getMangasByIds(mangaIds)

      if (mangaError) return []

      const mangaById = new Map<string, Manga>(
        mangaResp.data.map((manga) => [manga.id, manga])
      )

      return chapters.reduce<
        {
          id: string
          chapter: string
          title: string
          translatedLanguage: string
          groupName: string | null
          externalUrl: string | null
          manga: Manga
        }[]
      >((acc, chapter) => {
        const manga = mangaById.get(mangaRelId(chapter) ?? '')

        if (!manga) return acc

        const group = chapter.relationships.find(
          (rel) => rel.type === 'scanlation_group'
        )

        acc.push({
          id: chapter.id,
          chapter: chapter.attributes.chapter,
          title: chapter.attributes.title,
          translatedLanguage: chapter.attributes.translatedLanguage,
          groupName:
            (group?.attributes as { name?: string } | undefined)?.name ?? null,
          externalUrl: chapter.attributes.externalUrl ?? null,
          manga
        })

        return acc
      }, [])
    }
  },

  RelationshipAttributes: {
    /** Map a relationship's attributes to its GraphQL union member, or null. */
    __resolveType(obj: RelationshipAttributes) {
      if ('name' in obj) return 'ScanlationGroupAttributes'
      if ('username' in obj) return 'UserAttributes'

      return null
    }
  }
}
