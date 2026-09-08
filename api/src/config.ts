import { config as start } from 'dotenv'

start()

/**
 * Fail fast, naming the variable, when a required env var is missing — a clear
 * startup error beats a hidden hardcoded default.
 */
function required(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}. ` +
        'Configure-a no .env (dev) ou no Render (prod).'
    )
  }
  return value
}

export const config = {
  BASE_URL: process.env.BASE_URL,
  UPLOAD_BASE_URL: process.env.UPLOAD_BASE_URL,
  // External Postgres (Supabase/Neon) that stores the per-user backup.
  DATABASE_URL: required('DATABASE_URL'),
  // MangaDex Keycloak realm — used to verify access-token signatures (expected
  // issuer + JWKS with the public keys). See auth/verifyToken.
  MANGADEX_ISSUER: required('MANGADEX_ISSUER'),
  MANGADEX_JWKS_URL: required('MANGADEX_JWKS_URL')
}
