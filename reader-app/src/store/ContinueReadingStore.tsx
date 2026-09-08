import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { userScopedStorage } from './userScopedStorage'

const MAX_ENTRIES = 10

export interface ContinueReadingEntry {
  mangaId: string
  mangaName: string
  chapterId: string
  chapterNumber: string
  chapterName: string
  image: string
  page: number
  progress: number
  readAt: number
}

type RecordInput = Omit<ContinueReadingEntry, 'page' | 'progress' | 'readAt'>

interface ContinueReadingState {
  entries: ContinueReadingEntry[]
  recordOpen: (entry: RecordInput) => void
  updateProgress: (
    chapterId: string,
    page: number,
    progress: number,
    image: string
  ) => void
}

export const useContinueReading = create<ContinueReadingState>()(
  persist(
    (set, get) => ({
      entries: [],
      recordOpen: (entry) => {
        const current = get().entries
        const previous = current.find((e) => e.chapterId === entry.chapterId)
        const resume = previous
          ? {
              page: previous.page,
              progress: previous.progress,
              image: previous.image
            }
          : { page: 0, progress: 0, image: entry.image }

        const next = [
          { ...entry, ...resume, readAt: Date.now() },
          ...current.filter((e) => e.mangaId !== entry.mangaId)
        ].slice(0, MAX_ENTRIES)

        set({ entries: next })
      },
      updateProgress: (chapterId, page, progress, image) => {
        let changed = false
        const next = get().entries.map((e) => {
          if (e.chapterId !== chapterId) return e
          changed = true
          return { ...e, page, progress, image }
        })
        if (changed) set({ entries: next })
      }
    }),
    {
      name: '@continue-reading',
      storage: createJSONStorage(() => userScopedStorage),
      // Hidratação disparada pelo AuthContext (rehydrateUserStores).
      skipHydration: true
    }
  )
)
