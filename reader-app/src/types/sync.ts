import {
  type BookshelfEntry,
  type PageBookmarkEntry
} from '@/store/BookshelfStore'
import { type ContinueReadingEntry } from '@/store/ContinueReadingStore'
import { type ReadingMode } from '@/store/ReadingModeStore'

export interface SyncBlob {
  schemaVersion: number
  updatedAt: number
  bookshelf: { entries: BookshelfEntry[]; pageBookmarks: PageBookmarkEntry[] }
  continueReading: { entries: ContinueReadingEntry[] }
  readingMode: { overrides: Record<string, ReadingMode> }
}
