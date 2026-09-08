/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  fragment CardFields on Manga {\n    id\n    cover: coverUrl(size: 512)\n    attributes {\n      contentRating\n      title {\n        en\n        pt_br\n        ja\n      }\n      altTitles {\n        en\n        pt_br\n      }\n    }\n  }\n": typeof types.CardFieldsFragmentDoc,
    "\n  fragment DetailFields on Manga {\n    id\n    cover: coverUrl(size: 512)\n    attributes {\n      contentRating\n      title {\n        en\n        pt_br\n        ja\n      }\n      altTitles {\n        en\n        pt_br\n      }\n      description {\n        en\n        pt_br\n      }\n      tags {\n        attributes {\n          name {\n            en\n          }\n        }\n      }\n    }\n  }\n": typeof types.DetailFieldsFragmentDoc,
    "\n  query RecentlyAdded($limit: Int) {\n    mangas: recentlyAdded(limit: $limit) {\n      ...CardFields\n    }\n  }\n": typeof types.RecentlyAddedDocument,
    "\n  query HighestRanking($limit: Int) {\n    mangas: highestRanking(limit: $limit) {\n      ...CardFields\n    }\n  }\n": typeof types.HighestRankingDocument,
    "\n  query TopRatedRecent($limit: Int) {\n    mangas: topRatedRecent(limit: $limit) {\n      ...DetailFields\n    }\n  }\n": typeof types.TopRatedRecentDocument,
    "\n  query Manga($id: ID!) {\n    manga(id: $id) {\n      ...DetailFields\n    }\n  }\n": typeof types.MangaDocument,
    "\n  query MangasByTag($includedTags: [ID!]!, $limit: Int) {\n    mangas: mangasByTag(includedTags: $includedTags, limit: $limit) {\n      ...CardFields\n    }\n  }\n": typeof types.MangasByTagDocument,
    "\n  query ExploreMangas(\n    $title: String\n    $order: [MangaOrderInput!]\n    $includedTags: [ID!]\n    $limit: Int\n  ) {\n    mangas: exploreMangas(\n      title: $title\n      order: $order\n      includedTags: $includedTags\n      limit: $limit\n    ) {\n      ...CardFields\n    }\n  }\n": typeof types.ExploreMangasDocument,
    "\n  query Chapters($mangaId: ID!, $limit: Int, $offset: Int, $order: ChapterOrder) {\n    chapters(mangaId: $mangaId, limit: $limit, offset: $offset, order: $order) {\n      total\n      limit\n      offset\n      items {\n        id\n        attributes {\n          chapter\n          title\n          translatedLanguage\n          externalUrl\n        }\n        relationships {\n          type\n          attributes {\n            ... on ScanlationGroupAttributes {\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n": typeof types.ChaptersDocument,
    "\n  query ChapterImgs($chapterId: ID!) {\n    chapterImgs(chapterId: $chapterId)\n  }\n": typeof types.ChapterImgsDocument,
    "\n  query Chapter($id: ID!) {\n    chapter(id: $id) {\n      id\n      attributes {\n        chapter\n        title\n        externalUrl\n      }\n    }\n  }\n": typeof types.ChapterDocument,
    "\n  query LatestChapters($limit: Int) {\n    latestChapters(limit: $limit) {\n      id\n      chapter\n      title\n      groupName\n      externalUrl\n      manga {\n        ...CardFields\n      }\n    }\n  }\n": typeof types.LatestChaptersDocument,
    "\n  query AdjacentChapters($mangaId: ID!, $chapterId: ID!) {\n    adjacentChapters(mangaId: $mangaId, chapterId: $chapterId) {\n      next {\n        ...ChapterFields\n      }\n      prev {\n        ...ChapterFields\n      }\n    }\n  }\n": typeof types.AdjacentChaptersDocument,
    "\n  fragment ChapterFields on Chapter {\n    id\n    attributes {\n      chapter\n      title\n      translatedLanguage\n      externalUrl\n    }\n    relationships {\n      type\n      attributes {\n        ... on ScanlationGroupAttributes {\n          name\n        }\n      }\n    }\n  }\n": typeof types.ChapterFieldsFragmentDoc,
    "\n  query SyncPull {\n    syncPull {\n      blob\n      updatedAt\n    }\n  }\n": typeof types.SyncPullDocument,
    "\n  mutation SyncPush($blob: String!, $updatedAt: Float!) {\n    syncPush(blob: $blob, updatedAt: $updatedAt)\n  }\n": typeof types.SyncPushDocument,
    "\n  query Categories {\n    categories {\n      id\n      attributes {\n        name {\n          en\n          pt_br\n        }\n        group\n      }\n    }\n  }\n": typeof types.CategoriesDocument,
};
const documents: Documents = {
    "\n  fragment CardFields on Manga {\n    id\n    cover: coverUrl(size: 512)\n    attributes {\n      contentRating\n      title {\n        en\n        pt_br\n        ja\n      }\n      altTitles {\n        en\n        pt_br\n      }\n    }\n  }\n": types.CardFieldsFragmentDoc,
    "\n  fragment DetailFields on Manga {\n    id\n    cover: coverUrl(size: 512)\n    attributes {\n      contentRating\n      title {\n        en\n        pt_br\n        ja\n      }\n      altTitles {\n        en\n        pt_br\n      }\n      description {\n        en\n        pt_br\n      }\n      tags {\n        attributes {\n          name {\n            en\n          }\n        }\n      }\n    }\n  }\n": types.DetailFieldsFragmentDoc,
    "\n  query RecentlyAdded($limit: Int) {\n    mangas: recentlyAdded(limit: $limit) {\n      ...CardFields\n    }\n  }\n": types.RecentlyAddedDocument,
    "\n  query HighestRanking($limit: Int) {\n    mangas: highestRanking(limit: $limit) {\n      ...CardFields\n    }\n  }\n": types.HighestRankingDocument,
    "\n  query TopRatedRecent($limit: Int) {\n    mangas: topRatedRecent(limit: $limit) {\n      ...DetailFields\n    }\n  }\n": types.TopRatedRecentDocument,
    "\n  query Manga($id: ID!) {\n    manga(id: $id) {\n      ...DetailFields\n    }\n  }\n": types.MangaDocument,
    "\n  query MangasByTag($includedTags: [ID!]!, $limit: Int) {\n    mangas: mangasByTag(includedTags: $includedTags, limit: $limit) {\n      ...CardFields\n    }\n  }\n": types.MangasByTagDocument,
    "\n  query ExploreMangas(\n    $title: String\n    $order: [MangaOrderInput!]\n    $includedTags: [ID!]\n    $limit: Int\n  ) {\n    mangas: exploreMangas(\n      title: $title\n      order: $order\n      includedTags: $includedTags\n      limit: $limit\n    ) {\n      ...CardFields\n    }\n  }\n": types.ExploreMangasDocument,
    "\n  query Chapters($mangaId: ID!, $limit: Int, $offset: Int, $order: ChapterOrder) {\n    chapters(mangaId: $mangaId, limit: $limit, offset: $offset, order: $order) {\n      total\n      limit\n      offset\n      items {\n        id\n        attributes {\n          chapter\n          title\n          translatedLanguage\n          externalUrl\n        }\n        relationships {\n          type\n          attributes {\n            ... on ScanlationGroupAttributes {\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n": types.ChaptersDocument,
    "\n  query ChapterImgs($chapterId: ID!) {\n    chapterImgs(chapterId: $chapterId)\n  }\n": types.ChapterImgsDocument,
    "\n  query Chapter($id: ID!) {\n    chapter(id: $id) {\n      id\n      attributes {\n        chapter\n        title\n        externalUrl\n      }\n    }\n  }\n": types.ChapterDocument,
    "\n  query LatestChapters($limit: Int) {\n    latestChapters(limit: $limit) {\n      id\n      chapter\n      title\n      groupName\n      externalUrl\n      manga {\n        ...CardFields\n      }\n    }\n  }\n": types.LatestChaptersDocument,
    "\n  query AdjacentChapters($mangaId: ID!, $chapterId: ID!) {\n    adjacentChapters(mangaId: $mangaId, chapterId: $chapterId) {\n      next {\n        ...ChapterFields\n      }\n      prev {\n        ...ChapterFields\n      }\n    }\n  }\n": types.AdjacentChaptersDocument,
    "\n  fragment ChapterFields on Chapter {\n    id\n    attributes {\n      chapter\n      title\n      translatedLanguage\n      externalUrl\n    }\n    relationships {\n      type\n      attributes {\n        ... on ScanlationGroupAttributes {\n          name\n        }\n      }\n    }\n  }\n": types.ChapterFieldsFragmentDoc,
    "\n  query SyncPull {\n    syncPull {\n      blob\n      updatedAt\n    }\n  }\n": types.SyncPullDocument,
    "\n  mutation SyncPush($blob: String!, $updatedAt: Float!) {\n    syncPush(blob: $blob, updatedAt: $updatedAt)\n  }\n": types.SyncPushDocument,
    "\n  query Categories {\n    categories {\n      id\n      attributes {\n        name {\n          en\n          pt_br\n        }\n        group\n      }\n    }\n  }\n": types.CategoriesDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment CardFields on Manga {\n    id\n    cover: coverUrl(size: 512)\n    attributes {\n      contentRating\n      title {\n        en\n        pt_br\n        ja\n      }\n      altTitles {\n        en\n        pt_br\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment CardFields on Manga {\n    id\n    cover: coverUrl(size: 512)\n    attributes {\n      contentRating\n      title {\n        en\n        pt_br\n        ja\n      }\n      altTitles {\n        en\n        pt_br\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment DetailFields on Manga {\n    id\n    cover: coverUrl(size: 512)\n    attributes {\n      contentRating\n      title {\n        en\n        pt_br\n        ja\n      }\n      altTitles {\n        en\n        pt_br\n      }\n      description {\n        en\n        pt_br\n      }\n      tags {\n        attributes {\n          name {\n            en\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment DetailFields on Manga {\n    id\n    cover: coverUrl(size: 512)\n    attributes {\n      contentRating\n      title {\n        en\n        pt_br\n        ja\n      }\n      altTitles {\n        en\n        pt_br\n      }\n      description {\n        en\n        pt_br\n      }\n      tags {\n        attributes {\n          name {\n            en\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query RecentlyAdded($limit: Int) {\n    mangas: recentlyAdded(limit: $limit) {\n      ...CardFields\n    }\n  }\n"): (typeof documents)["\n  query RecentlyAdded($limit: Int) {\n    mangas: recentlyAdded(limit: $limit) {\n      ...CardFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query HighestRanking($limit: Int) {\n    mangas: highestRanking(limit: $limit) {\n      ...CardFields\n    }\n  }\n"): (typeof documents)["\n  query HighestRanking($limit: Int) {\n    mangas: highestRanking(limit: $limit) {\n      ...CardFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query TopRatedRecent($limit: Int) {\n    mangas: topRatedRecent(limit: $limit) {\n      ...DetailFields\n    }\n  }\n"): (typeof documents)["\n  query TopRatedRecent($limit: Int) {\n    mangas: topRatedRecent(limit: $limit) {\n      ...DetailFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Manga($id: ID!) {\n    manga(id: $id) {\n      ...DetailFields\n    }\n  }\n"): (typeof documents)["\n  query Manga($id: ID!) {\n    manga(id: $id) {\n      ...DetailFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query MangasByTag($includedTags: [ID!]!, $limit: Int) {\n    mangas: mangasByTag(includedTags: $includedTags, limit: $limit) {\n      ...CardFields\n    }\n  }\n"): (typeof documents)["\n  query MangasByTag($includedTags: [ID!]!, $limit: Int) {\n    mangas: mangasByTag(includedTags: $includedTags, limit: $limit) {\n      ...CardFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ExploreMangas(\n    $title: String\n    $order: [MangaOrderInput!]\n    $includedTags: [ID!]\n    $limit: Int\n  ) {\n    mangas: exploreMangas(\n      title: $title\n      order: $order\n      includedTags: $includedTags\n      limit: $limit\n    ) {\n      ...CardFields\n    }\n  }\n"): (typeof documents)["\n  query ExploreMangas(\n    $title: String\n    $order: [MangaOrderInput!]\n    $includedTags: [ID!]\n    $limit: Int\n  ) {\n    mangas: exploreMangas(\n      title: $title\n      order: $order\n      includedTags: $includedTags\n      limit: $limit\n    ) {\n      ...CardFields\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Chapters($mangaId: ID!, $limit: Int, $offset: Int, $order: ChapterOrder) {\n    chapters(mangaId: $mangaId, limit: $limit, offset: $offset, order: $order) {\n      total\n      limit\n      offset\n      items {\n        id\n        attributes {\n          chapter\n          title\n          translatedLanguage\n          externalUrl\n        }\n        relationships {\n          type\n          attributes {\n            ... on ScanlationGroupAttributes {\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query Chapters($mangaId: ID!, $limit: Int, $offset: Int, $order: ChapterOrder) {\n    chapters(mangaId: $mangaId, limit: $limit, offset: $offset, order: $order) {\n      total\n      limit\n      offset\n      items {\n        id\n        attributes {\n          chapter\n          title\n          translatedLanguage\n          externalUrl\n        }\n        relationships {\n          type\n          attributes {\n            ... on ScanlationGroupAttributes {\n              name\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ChapterImgs($chapterId: ID!) {\n    chapterImgs(chapterId: $chapterId)\n  }\n"): (typeof documents)["\n  query ChapterImgs($chapterId: ID!) {\n    chapterImgs(chapterId: $chapterId)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Chapter($id: ID!) {\n    chapter(id: $id) {\n      id\n      attributes {\n        chapter\n        title\n        externalUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  query Chapter($id: ID!) {\n    chapter(id: $id) {\n      id\n      attributes {\n        chapter\n        title\n        externalUrl\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query LatestChapters($limit: Int) {\n    latestChapters(limit: $limit) {\n      id\n      chapter\n      title\n      groupName\n      externalUrl\n      manga {\n        ...CardFields\n      }\n    }\n  }\n"): (typeof documents)["\n  query LatestChapters($limit: Int) {\n    latestChapters(limit: $limit) {\n      id\n      chapter\n      title\n      groupName\n      externalUrl\n      manga {\n        ...CardFields\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query AdjacentChapters($mangaId: ID!, $chapterId: ID!) {\n    adjacentChapters(mangaId: $mangaId, chapterId: $chapterId) {\n      next {\n        ...ChapterFields\n      }\n      prev {\n        ...ChapterFields\n      }\n    }\n  }\n"): (typeof documents)["\n  query AdjacentChapters($mangaId: ID!, $chapterId: ID!) {\n    adjacentChapters(mangaId: $mangaId, chapterId: $chapterId) {\n      next {\n        ...ChapterFields\n      }\n      prev {\n        ...ChapterFields\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  fragment ChapterFields on Chapter {\n    id\n    attributes {\n      chapter\n      title\n      translatedLanguage\n      externalUrl\n    }\n    relationships {\n      type\n      attributes {\n        ... on ScanlationGroupAttributes {\n          name\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  fragment ChapterFields on Chapter {\n    id\n    attributes {\n      chapter\n      title\n      translatedLanguage\n      externalUrl\n    }\n    relationships {\n      type\n      attributes {\n        ... on ScanlationGroupAttributes {\n          name\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query SyncPull {\n    syncPull {\n      blob\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  query SyncPull {\n    syncPull {\n      blob\n      updatedAt\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation SyncPush($blob: String!, $updatedAt: Float!) {\n    syncPush(blob: $blob, updatedAt: $updatedAt)\n  }\n"): (typeof documents)["\n  mutation SyncPush($blob: String!, $updatedAt: Float!) {\n    syncPush(blob: $blob, updatedAt: $updatedAt)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query Categories {\n    categories {\n      id\n      attributes {\n        name {\n          en\n          pt_br\n        }\n        group\n      }\n    }\n  }\n"): (typeof documents)["\n  query Categories {\n    categories {\n      id\n      attributes {\n        name {\n          en\n          pt_br\n        }\n        group\n      }\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;