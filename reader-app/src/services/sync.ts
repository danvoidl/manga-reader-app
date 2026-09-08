import { gqlRequest } from '@/services/graphql'
import { graphql } from '@/gql'

const SYNC_PULL = graphql(`
  query SyncPull {
    syncPull {
      blob
      updatedAt
    }
  }
`)

const SYNC_PUSH = graphql(`
  mutation SyncPush($blob: String!, $updatedAt: Float!) {
    syncPush(blob: $blob, updatedAt: $updatedAt)
  }
`)

/** Backup do usuário autenticado, ou null se ele ainda não sincronizou. */
export async function pull(): Promise<{
  blob: string
  updatedAt: number
} | null> {
  const data = await gqlRequest(SYNC_PULL)
  return data.syncPull
}

/** Grava o backup. Retorna o `updatedAt` efetivo (o servidor faz last-write-wins). */
export async function push(blob: string, updatedAt: number): Promise<number> {
  const data = await gqlRequest(SYNC_PUSH, { blob, updatedAt })
  return data.syncPush
}
