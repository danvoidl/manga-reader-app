import * as SecureStore from "expo-secure-store";

// Everything here is persisted only in the device's secure enclave
// (iOS Keychain / Android Keystore). The user's password is intentionally
// NOT stored — only what's needed to refresh the session.
const SESSION_KEY = "mangadex_session";

export interface StoredSession {
  username: string;
  /** MangaDex user id (JWT `sub`); namespaces on-device data and Drive backup. */
  userId: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  /** Epoch millis when the access token expires. */
  accessTokenExpiresAt: number;
}

export async function saveSession(session: StoredSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession(): Promise<StoredSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    // Corrupted payload — drop it so the app can recover with a fresh login.
    await clearSession();
    return null;
  }
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
