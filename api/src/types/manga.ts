/** A MangaDex manga with its included relationships (cover_art, author, ...). */
export interface Manga {
  id: string
  type: string
  attributes: MangaAttributes
  relationships: Relationship[]
}

interface MangaAttributes {
  title: LocalizedString
  altTitles: [LocalizedString]
  description: LocalizedString
  isLocked: boolean
  links: MangaLinks
  originalLanguage: string
  lastVolume: string
  lastChapter: string
  publicationDemographic: string
  status: string
  year: number
  contentRating: string
  tags: [Tag]
  state: string
  chapterNumbersResetOnNewVolume: boolean
  createdAt: string
  updatedAt: string
  version: number
  availableTranslatedLanguages: string[]
  latestUploadedChapter: string
}

interface LocalizedString {
  en: string
  ko: string
  ja: string
  ru: string
  zh: string
  pt_br: string
}

interface MangaLinks {
  al: string
  ap: string
  bw: string
  kt: string
  mu: string
  nu: string
  amz: string
  ebj: string
  mal: string
  raw: string
  engtl: string
}

/** A MangaDex tag/genre (used for category filtering). */
export interface Tag {
  id: string
  type: string
  attributes: TagAttributes
  relationships: Relationship[]
}

interface TagAttributes {
  name: LocalizedString
  description: string
  group: string
  version: number
}

interface Relationship {
  id: string
  type: string
  related: string
  attributes: RelationshipAttributes
}

interface RelationshipAttributes {
  description: string
  volume: string
  fileName: string
  locale: string
  createdAt: string
  updatedAt: string
  version: number
}
