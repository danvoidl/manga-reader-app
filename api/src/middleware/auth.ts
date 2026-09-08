import { ApolloServerPlugin } from '@apollo/server'
import { ApiModules } from '../repository/api'
import { GraphQLError } from 'graphql'

/**
 * Per-request GraphQL context. The token is the caller's MangaDex access token
 * (forwarded by the reader-app); `modules` is an HTTP client bound to it, so
 * every upstream call runs under that user's identity.
 */
export interface GraphQLContext {
  token: string | null
  modules: ApiModules | null
}

/** Pull the bearer token out of the incoming Authorization header. */
export function bearerFrom(header?: string): string | null {
  if (!header) return null
  const [scheme, value] = header.split(' ')
  if (scheme?.toLowerCase() !== 'bearer' || !value) return null
  return value
}

/**
 * Require an authenticated caller for every real operation. Introspection is
 * left open so the reader-app's GraphQL codegen can read the schema over HTTP
 * without a token.
 */
export const requireAuth: ApolloServerPlugin<GraphQLContext> = {
  async requestDidStart() {
    return {
      async didResolveOperation({ request, contextValue }) {
        if (request.operationName === 'IntrospectionQuery') return
        if (!contextValue.token) {
          throw new GraphQLError('Não autenticado', {
            extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } }
          })
        }
      }
    }
  }
}
