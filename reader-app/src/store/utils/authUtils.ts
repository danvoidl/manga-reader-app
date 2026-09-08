import { StoredSession } from "@/services/secureStore";
import { LoginParams, AuthTokens } from "@/services/auth";
import { decodeJwtSub } from "@/utils/jwt";
import { setActiveUser } from "@/store/userScopedStorage";
import { rehydrateUserStores } from "@/store/rehydrateStores";

export function sessionFromTokens(
  params: LoginParams,
  tokens: AuthTokens,
): StoredSession {
  return {
    username: params.username,
    userId: decodeJwtSub(tokens.access_token) ?? params.username,
    clientId: params.clientId,
    clientSecret: params.clientSecret,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    accessTokenExpiresAt: Date.now() + tokens.expires_in * 1000,
  };
}

// Aponta o storage local para o namespace do usuário e recarrega os 3 stores.
// Usado ao logar, deslogar e restaurar a sessão no startup.
export async function switchLocalDataTo(userId: string | null) {
  setActiveUser(userId);
  await rehydrateUserStores();
}