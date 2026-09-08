import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { userScopedStorage } from './userScopedStorage'

export type BookshelfStatus = 'want-to-read' | 'reading' | 'read' | 'dropped'

// One manga marked in the Estante. `cover`/`mangaName` are denormalized so the
// grid can render without hitting the API again.
export interface BookshelfEntry {
  mangaId: string
  mangaName: string
  cover?: string
  status: BookshelfStatus
  updatedAt: number
}

// A single saved page inside a chapter, grouped by `chapterId` on the Estante's
// "Páginas" view. `image` is the page URL at bookmark time, used as thumbnail.
export interface PageBookmarkEntry {
  mangaId: string
  mangaName: string
  chapterId: string
  chapterNumber: string
  chapterName: string
  pageIndex: number
  image: string
  bookmarkedAt: number
}

type StatusInput = { id: string; name: string; cover?: string }
type PageBookmarkInput = Omit<PageBookmarkEntry, 'bookmarkedAt'>

interface BookshelfState {
  entries: BookshelfEntry[]
  pageBookmarks: PageBookmarkEntry[]
  setStatus: (manga: StatusInput, status: BookshelfStatus) => void
  removeEntry: (mangaId: string) => void
  togglePageBookmark: (entry: PageBookmarkInput) => void
  removePageBookmark: (chapterId: string, pageIndex: number) => void
}

export const useBookshelf = create<BookshelfState>()(
  persist(
    (set, get) => ({
      entries: [],
      pageBookmarks: [],

      // Upsert 1-per-manga: switching status replaces the existing entry.
      setStatus: (manga, status) => {
        const next: BookshelfEntry[] = [
          {
            mangaId: manga.id,
            mangaName: manga.name,
            cover: manga.cover,
            status,
            updatedAt: Date.now()
          },
          ...get().entries.filter((e) => e.mangaId !== manga.id)
        ]

        set({ entries: next })
      },

      removeEntry: (mangaId) => {
        set({ entries: get().entries.filter((e) => e.mangaId !== mangaId) })
      },

      togglePageBookmark: (entry) => {
        const bookmarks = get().pageBookmarks
        const exists = bookmarks.some(
          (b) => b.chapterId === entry.chapterId && b.pageIndex === entry.pageIndex
        )

        const next = exists
          ? bookmarks.filter(
              (b) =>
                !(b.chapterId === entry.chapterId && b.pageIndex === entry.pageIndex)
            )
          : [...bookmarks, { ...entry, bookmarkedAt: Date.now() }]

        set({ pageBookmarks: next })
      },

      removePageBookmark: (chapterId, pageIndex) => {
        set({
          pageBookmarks: get().pageBookmarks.filter(
            (b) => !(b.chapterId === chapterId && b.pageIndex === pageIndex)
          )
        })
      }
    }),
    {
      name: '@bookshelf',
      storage: createJSONStorage(() => userScopedStorage),
      // Hidratação é disparada pelo AuthContext (rehydrateUserStores) depois que
      // o usuário ativo é conhecido, evitando ler o namespace errado no startup.
      skipHydration: true
    }
  )
)
