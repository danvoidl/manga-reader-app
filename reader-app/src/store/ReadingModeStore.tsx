import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { userScopedStorage } from './userScopedStorage'

export type ReadingMode = 'horizontal' | 'vertical'

interface ReadingModeState {
  overrides: Record<string, ReadingMode>
  setOverride: (mangaId: string, mode: ReadingMode) => void
}

export const useReadingModeOverrides = create<ReadingModeState>()(
  persist(
    (set, get) => ({
      overrides: {},
      setOverride: (mangaId, mode) => {
        set({ overrides: { ...get().overrides, [mangaId]: mode } })
      }
    }),
    {
      name: '@reading-mode-overrides',
      storage: createJSONStorage(() => userScopedStorage),
      // Hidratação disparada pelo AuthContext (rehydrateUserStores).
      skipHydration: true
    }
  )
)
