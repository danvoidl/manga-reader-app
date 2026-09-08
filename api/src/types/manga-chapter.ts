interface ChapterAttributes {
  volume: string
  chapter: string
  title: string
  translatedLanguage: string
  externalUrl: string
  publishAt: string
  readableAt: string
  createdAt: string
  updatedAt: string
  pages: number
  version: number
}

interface ScanlationGroupAttributes {
  name: string
  altNames: [string]
  locked: boolean
  website: string
  ircServer: string
  ircChannel: string
  discord: string
  contactEmail: string
  description: string
  twitter: string
  mangaUpdates: string
  focusedLanguages: [string]
  official: boolean
  verified: boolean
  inactive: boolean
  publishDelay: string
  exLicensed: boolean
  createdAt: string
  updatedAt: string
  version: number
}

interface UserAttributes {
  username: string
  roles: [string]
  version: number
}

/** Attributes of a chapter relationship, resolved as a GraphQL union. */
export type RelationshipAttributes = ScanlationGroupAttributes | UserAttributes

interface Relationship {
  id: string
  type: 'scanlation_group' | 'manga' | 'user'
  attributes: RelationshipAttributes
}

/** A MangaDex chapter with its included relationships (group, manga, ...). */
export interface Chapter {
  id: string
  type: string
  attributes: ChapterAttributes
  relationships: [Relationship]
}

/** At-home server response used to assemble full-size page image URLs. */
export interface GetChapterImgs {
  result: string
  baseUrl: string
  chapter: {
    hash: string
    data: string[]
  }
}