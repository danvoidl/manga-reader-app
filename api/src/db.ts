import pg from 'pg'
import { config } from '~/src/config'

// Backup persistence: one row per MangaDex user (`sync_blobs`), holding the JSON
// blob of the app's stores plus an `updated_at` (last-write-wins watermark). The
// server was stateless; this is the only state it keeps. Storage is an external
// Postgres (Supabase/Neon, free tier) — see DATABASE_URL in config.ts.

const { Pool } = pg

let pool: pg.Pool | null = null

function getPool(): pg.Pool {
  if (pool) return pool
  const connectionString = config.DATABASE_URL
  // Supabase/Neon require TLS; local Postgres (dev/test) doesn't speak SSL. We
  // enable TLS by default and turn it off only for localhost or when
  // `sslmode=disable` is in the URL — so the same code serves prod and dev.
  const noSsl =
    /sslmode=disable/.test(connectionString) ||
    /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString)
  pool = new Pool({
    connectionString,
    ssl: noSsl ? false : { rejectUnauthorized: false }
  })
  return pool
}

/** Create the table on server startup (idempotent). Called once from index.ts. */
export async function initDb(): Promise<void> {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS sync_blobs (
      user_id    text   PRIMARY KEY,
      blob       jsonb  NOT NULL,
      updated_at bigint NOT NULL
    )
  `)
}

/** A user's stored backup: the serialized blob plus its last-write watermark. */
export interface StoredBlob {
  blob: string
  updatedAt: number
}

/** The user's blob, or null if they haven't synced anything yet. */
export async function getBlob(userId: string): Promise<StoredBlob | null> {
  const res = await getPool().query<{ blob: unknown; updated_at: string }>(
    'SELECT blob, updated_at FROM sync_blobs WHERE user_id = $1',
    [userId]
  )
  const row = res.rows[0]
  if (!row) return null
  // `blob` is jsonb; the driver returns it already parsed — the app expects a
  // String, so we reserialize to keep the schema's `blob: String` contract.
  return { blob: JSON.stringify(row.blob), updatedAt: Number(row.updated_at) }
}

/**
 * Write the user's blob (upsert). Ignores writes older than the stored one
 * (last-write-wins by updatedAt), so a late push can't overwrite a newer
 * version. Returns the effective updatedAt after the operation.
 */
export async function putBlob(
  userId: string,
  blob: string,
  updatedAt: number
): Promise<number> {
  // `blob` arrives as a JSON String; we convert it to jsonb in the DB ($2::jsonb).
  const res = await getPool().query<{ updated_at: string }>(
    `
    INSERT INTO sync_blobs (user_id, blob, updated_at)
    VALUES ($1, $2::jsonb, $3)
    ON CONFLICT (user_id) DO UPDATE
      SET blob = EXCLUDED.blob, updated_at = EXCLUDED.updated_at
      WHERE EXCLUDED.updated_at >= sync_blobs.updated_at
    RETURNING updated_at
    `,
    [userId, blob, updatedAt]
  )
  // No row returned = the WHERE blocked it (stored version is newer); return that.
  if (res.rows[0]) return Number(res.rows[0].updated_at)
  const current = await getBlob(userId)
  return current?.updatedAt ?? updatedAt
}
