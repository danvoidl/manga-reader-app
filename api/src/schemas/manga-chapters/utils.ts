import { Chapter } from '~/src/types/manga-chapter'

/**
 * Western-language preference: earlier = higher priority. Anything not listed
 * falls to the end (kept only when it's the sole option for a chapter).
 */
export const LANG_PRIORITY = [
  'pt-br',
  'en',
  'es',
  'es-la',
  'fr',
  'it',
  'de',
  'pt',
  'ca',
  'nl',
  'pl'
]

/** Rank a language by LANG_PRIORITY; unlisted languages sort last. */
function langScore(lang: string): number {
  const index = LANG_PRIORITY.indexOf(lang)
  return index === -1 ? LANG_PRIORITY.length : index
}

/**
 * Keep one chapter per chapter number, choosing the best-ranked language.
 * Falls back to the chapter id as key for entries with no number (e.g. oneshots).
 */
export function dedupeByBestLanguage(chapters: Chapter[]): Chapter[] {
  const byNumber = new Map<string, Chapter>()

  for (const chapter of chapters) {
    const key = chapter.attributes.chapter ?? chapter.id
    const current = byNumber.get(key)

    if (
      !current ||
      langScore(chapter.attributes.translatedLanguage) <
        langScore(current.attributes.translatedLanguage)
    ) {
      byNumber.set(key, chapter)
    }
  }

  // Sort by chapter number descending (latest first); non-numeric last.
  return [...byNumber.values()].sort((a, b) => {
    const na = parseFloat(a.attributes.chapter)
    const nb = parseFloat(b.attributes.chapter)

    if (isNaN(na)) return 1
    if (isNaN(nb)) return -1

    return nb - na
  })
}

/** Id of the manga a chapter belongs to (from its `manga` relationship). */
export function mangaRelId(chapter: Chapter): string | undefined {
  return chapter.relationships.find((rel) => rel.type === 'manga')?.id
}