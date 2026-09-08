import AsyncStorage from '@react-native-async-storage/async-storage'
import { useBookshelf } from '@/store/BookshelfStore'
import { useContinueReading } from '@/store/ContinueReadingStore'
import { useReadingModeOverrides } from '@/store/ReadingModeStore'
import { SyncBlob } from '@/types/sync'

const SCHEMA_VERSION = 1

// Marca d'água local da última alteração conhecida (por usuário). Persistida pra
// que edições offline sobrevivam a reinícios e vençam no last-write-wins.
export const metaKey = (userId: string) => `@sync-updated-at:${userId}`

export async function getLocalUpdatedAt(userId: string): Promise<number> {
  const raw = await AsyncStorage.getItem(metaKey(userId))
  return raw ? Number(raw) || 0 : 0
}

export async function setLocalUpdatedAt(userId: string, at: number) {
  await AsyncStorage.setItem(metaKey(userId), String(at))
}

export function buildBlob(updatedAt: number) {
  const bs = useBookshelf.getState()
  const cr = useContinueReading.getState()
  const rm = useReadingModeOverrides.getState()

  return {
    schemaVersion: SCHEMA_VERSION,
    updatedAt,
    bookshelf: { entries: bs.entries, pageBookmarks: bs.pageBookmarks },
    continueReading: { entries: cr.entries },
    readingMode: { overrides: rm.overrides }
  }
}

export function applyBlob(blob: SyncBlob) {
  useBookshelf.setState({
    entries: blob.bookshelf?.entries ?? [],
    pageBookmarks: blob.bookshelf?.pageBookmarks ?? []
  })
  useContinueReading.setState({
    entries: blob.continueReading?.entries ?? []
  })
  useReadingModeOverrides.setState({
    overrides: blob.readingMode?.overrides ?? {}
  })
}
