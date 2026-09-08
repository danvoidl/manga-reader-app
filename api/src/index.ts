import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { schema } from './schemas'
import { createModules } from './repository/api'
import { requireAuth, GraphQLContext, bearerFrom } from './middleware/auth'
import { initDb } from './db'

// Create the backup table on startup (idempotent).
await initDb()

const server = new ApolloServer<GraphQLContext>({
  schema,
  // Apollo disables introspection when NODE_ENV=production. We keep it on so
  // the frontend GraphQL codegen can introspect the deployed schema over HTTP. 
  introspection: true,
  plugins: [requireAuth]
})

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => {
    const token = bearerFrom(req.headers.authorization)
    return { token, modules: token ? createModules(token) : null }
  },
  listen: { port: Number(process.env.PORT) || 4000 }
})

console.log(`🚀 Server ready at: ${url}`)
