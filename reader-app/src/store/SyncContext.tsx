import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { AppState, type AppStateStatus } from 'react-native'
import { useAuth } from '@/store/AuthContext'
import { pull as syncPull, push as syncPush } from '@/services/sync'
import { useBookshelf } from '@/store/BookshelfStore'
import { useContinueReading } from '@/store/ContinueReadingStore'
import { useReadingModeOverrides } from '@/store/ReadingModeStore'
import { SyncBlob } from '@/types/sync'
import {
  applyBlob,
  getLocalUpdatedAt,
  setLocalUpdatedAt,
  buildBlob
} from './utils/syncUtils'

// Modelo de disparo (para não bater no banco toda hora):
// - Puxa no login/troca de conta e hidrata os stores.
// - Empurra ao SAIR do foreground (background/inactive), só se houver mudança pendente.
// - Rede de segurança: durante uso ativo, um flush no máximo a cada
//   SAFETY_FLUSH_MS, só se houver mudança — limita a perda em caso de crash.
// - Backstop: o pull no próximo open reconcilia (local mais novo vence), então
//   um push de saída que o SO suspendeu antes de terminar é recuperado depois.

// Janela máxima de defasagem durante uso ativo (rede de segurança). Um flush
// dispara no máximo uma vez por janela. 0 desliga a rede (só push ao sair).
const SAFETY_FLUSH_MS = 60_000

interface SyncContextValue {
  syncing: boolean
  lastSyncedAt: number | null
  syncNow: () => Promise<void>
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined)

export function useSync(): SyncContextValue {
  const ctx = useContext(SyncContext)
  if (!ctx) throw new Error('useSync deve ser usado dentro de um SyncProvider')
  return ctx
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth()
  const [syncing, setSyncing] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null)

  const flushTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Só empurramos alterações depois que o pull inicial hidratou os stores, pra
  // não reenviar de volta o que acabamos de baixar.
  const hydratedRef = useRef(false)
  // Há alterações locais ainda não enviadas à nuvem.
  const dirtyRef = useRef(false)
  // Estado atual do app, pra detectar a transição de foreground → saída.
  const appStateRef = useRef(AppState.currentState)

  const push = useCallback(async (uid: string) => {
    setSyncing(true)
    // Vamos capturar o estado atual em buildBlob — a partir daqui contamos como
    // enviado. Uma mudança que chegar durante o await remarca dirty e sobrevive
    // (o blob em trânsito foi montado antes dela).
    dirtyRef.current = false
    try {
      const at = (await getLocalUpdatedAt(uid)) || Date.now()
      const effectiveAt = await syncPush(JSON.stringify(buildBlob(at)), at)
      await setLocalUpdatedAt(uid, effectiveAt)
      setLastSyncedAt(effectiveAt)
    } catch {
      // Offline / sessão expirada — mantém o cache local e a marca de pendência
      // pra tentar de novo depois (próxima janela ou saída do app).
      dirtyRef.current = true
    } finally {
      setSyncing(false)
    }
  }, [])

  const pull = useCallback(
    async (uid: string, isCancelled: () => boolean) => {
      setSyncing(true)

      try {
        const remote = await syncPull()
        if (isCancelled()) return

        if (!remote) {
          // Primeira vez neste usuário: sobe o que já existe localmente.
          await push(uid)
          return
        }

        const localAt = await getLocalUpdatedAt(uid)

        if ((remote.updatedAt ?? 0) >= localAt) {
          applyBlob(JSON.parse(remote.blob) as SyncBlob)
          await setLocalUpdatedAt(uid, remote.updatedAt ?? Date.now())
          setLastSyncedAt(remote.updatedAt ?? null)
        } else {
          // Local tem edições mais novas (offline) — elas vencem.
          await push(uid)
        }
      } catch {
        // Falha de rede/sessão — segue no cache local.
      } finally {
        hydratedRef.current = true
        setSyncing(false)
      }
    },
    [push]
  )

  // Pull quando há usuário logado (ou ao trocar de conta).
  useEffect(() => {
    hydratedRef.current = false

    if (!userId) return

    let cancelled = false
    void pull(userId, () => cancelled)

    return () => {
      cancelled = true
    }
  }, [userId, pull])

  // Assina os stores; marca pendência e arma a rede de segurança (throttle) a
  // cada alteração real do usuário. O envio "normal" acontece ao sair do app.
  useEffect(() => {
    if (!userId) return

    const schedule = () => {
      if (!hydratedRef.current) return

      dirtyRef.current = true
      // Marca d'água local (last-write-wins) — sobrevive a um kill e vence o
      // remoto na reconciliação do próximo open.
      void setLocalUpdatedAt(userId, Date.now())
      // Throttle: arma só se não houver timer pendente, então flush no máximo
      // uma vez por janela mesmo durante leitura contínua (debounce nunca
      // dispararia). Ao sair do app o push acontece antes disso.
      if (SAFETY_FLUSH_MS > 0 && !flushTimer.current) {
        flushTimer.current = setTimeout(() => {
          flushTimer.current = null
          if (dirtyRef.current) void push(userId)
        }, SAFETY_FLUSH_MS)
      }
    }

    const unsub = [
      useBookshelf.subscribe(schedule),
      useContinueReading.subscribe(schedule),
      useReadingModeOverrides.subscribe(schedule)
    ]
    return () => {
      unsub.forEach((u) => u())
      if (flushTimer.current) {
        clearTimeout(flushTimer.current)
        flushTimer.current = null
      }
    }
  }, [userId, push])

  // Empurra ao sair do foreground (background/inactive), se houver mudança
  // pendente. É best-effort — o SO pode suspender antes de terminar; nesse caso
  // o pull do próximo open reconcilia. Cobre Android (background) e iOS
  // (inactive → background); o guard prev === "active" dispara uma vez por saída.
  useEffect(() => {
    if (!userId) return

    const handler = (next: AppStateStatus) => {
      const prev = appStateRef.current
      appStateRef.current = next
      const leftForeground = prev === 'active' && next !== 'active'

      if (leftForeground && hydratedRef.current && dirtyRef.current) {
        if (flushTimer.current) {
          clearTimeout(flushTimer.current)
          flushTimer.current = null
        }
        push(userId)
      }
    }

    const sub = AppState.addEventListener('change', handler)
    return () => sub.remove()
  }, [userId, push])

  const syncNow = useCallback(async () => {
    if (userId) await push(userId)
  }, [userId, push])

  return (
    <SyncContext.Provider value={{ syncing, lastSyncedAt, syncNow }}>
      {children}
    </SyncContext.Provider>
  )
}
