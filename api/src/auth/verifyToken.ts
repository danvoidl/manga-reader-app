import { createRemoteJWKSet, jwtVerify } from 'jose'
import { GraphQLError } from 'graphql'
import { config } from '~/src/config'

// Verifies the MangaDex access token (Keycloak JWT) and returns its `sub` (user
// id). We must VERIFY the signature — decoding isn't enough — because `sub`
// decides whose backup blob it is: a token forged with someone else's `sub`
// would read/write another person's data. The public keys come from the realm's
// JWKS and are cached by `jose`, so there's no round-trip to MangaDex per request.
//
// The expected issuer and the JWKS URL come from config (required env vars) —
// no hardcoded defaults here.

const jwks = createRemoteJWKSet(new URL(config.MANGADEX_JWKS_URL))

/** Build a 401 UNAUTHENTICATED GraphQL error (message stays user-facing pt-BR). */
function unauthenticated(message = 'Token inválido'): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } }
  })
}

/** The token's verified `sub`, or throws UNAUTHENTICATED if invalid/expired. */
export async function verifiedUserId(token: string | null): Promise<string> {
  if (!token) throw unauthenticated('Não autenticado')
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: config.MANGADEX_ISSUER
    })
    const sub = payload.sub
    if (typeof sub !== 'string' || !sub) throw unauthenticated()
    return sub
  } catch (err) {
    if (err instanceof GraphQLError) throw err
    // Invalid signature, expired, wrong issuer, etc. — never leak details.
    throw unauthenticated()
  }
}
