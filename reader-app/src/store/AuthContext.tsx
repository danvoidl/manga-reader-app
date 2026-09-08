import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  login as authLogin,
  refresh as authRefresh,
  type LoginParams
} from '@/services/auth'
import {
  clearSession,
  loadSession,
  saveSession,
  type StoredSession
} from '@/services/secureStore'
import { setAuthTokenGetter } from '@/services/graphql'
import { queryClient } from '@/services/queryClient'
import { decodeJwtSub } from '@/utils/jwt'
import { sessionFromTokens, switchLocalDataTo } from './utils/authUtils'

// Refresh a bit before the real expiry to avoid using an almost-dead token.
const EXPIRY_SKEW_MS = 30_000

interface AuthContextValue {
  username: string | null
  /** MangaDex user id of the current session (JWT `sub`), or null if logged out. */
  userId: string | null
  isAuthenticated: boolean
  /** True while the persisted session is being restored on startup. */
  loading: boolean
  login: (params: LoginParams) => Promise<void>
  logout: () => Promise<void>
  /** Returns a valid access token, refreshing it if needed. Null if logged out. */
  getValidAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(null)
  const [loading, setLoading] = useState(true)

  // Keep a ref in sync so getValidAccessToken always reads the latest session
  // without being recreated (and without racing concurrent callers).
  const sessionRef = useRef<StoredSession | null>(null)
  const refreshPromise = useRef<Promise<string | null> | null>(null)

  const persist = useCallback(async (next: StoredSession | null) => {
    sessionRef.current = next
    setSession(next)
    if (next) {
      await saveSession(next)
    } else {
      await clearSession()
    }
  }, [])

  useEffect(() => {
    let active = true
    
    loadSession()
      .then(async (restored) => {
        if (!active) return
        // Sessões salvas antes deste recurso não têm userId — deriva do token.
        const normalized =
          restored && !restored.userId
            ? {
                ...restored,
                userId: decodeJwtSub(restored.accessToken) ?? restored.username
              }
            : restored
        sessionRef.current = normalized
        setSession(normalized)
        await switchLocalDataTo(normalized?.userId ?? null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const login = useCallback(
    async (params: LoginParams) => {
      const tokens = await authLogin(params)
      const next = sessionFromTokens(params, tokens)
      await persist(next)
      // Aponta o storage local para a conta que acabou de logar e carrega seus dados.
      await switchLocalDataTo(next.userId)
    },
    [persist]
  )

  const logout = useCallback(async () => {
    await persist(null)
    // Drop any cached data fetched under the previous user, so a different
    // account signing in on the same device never sees the old user's results.
    queryClient.clear()
    // Volta os stores locais para o namespace `anon` (vazio) — os dados da conta
    // anterior ficam preservados sob a chave dela, apenas não aparecem.
    await switchLocalDataTo(null)
  }, [persist])

  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    const current = sessionRef.current
    if (!current) return null

    if (Date.now() < current.accessTokenExpiresAt - EXPIRY_SKEW_MS) {
      return current.accessToken
    }

    // Coalesce concurrent refreshes into a single in-flight request.
    if (!refreshPromise.current) {
      refreshPromise.current = (async () => {
        try {
          const tokens = await authRefresh({
            clientId: current.clientId,
            clientSecret: current.clientSecret,
            refreshToken: current.refreshToken
          })
          await persist({
            ...current,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            accessTokenExpiresAt: Date.now() + tokens.expires_in * 1000
          })
          return tokens.access_token
        } catch {
          // Refresh token likely expired — force a fresh login.
          await persist(null)
          return null
        } finally {
          refreshPromise.current = null
        }
      })()
    }

    return refreshPromise.current
  }, [persist])

  // Let the plain (non-React) gqlRequest layer pull a valid token per request.
  useEffect(() => {
    setAuthTokenGetter(getValidAccessToken)
    return () => setAuthTokenGetter(null)
  }, [getValidAccessToken])

  return (
    <AuthContext.Provider
      value={{
        username: session?.username ?? null,
        userId: session?.userId ?? null,
        isAuthenticated: !!session,
        loading,
        login,
        logout,
        getValidAccessToken
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
