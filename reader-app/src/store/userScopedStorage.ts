import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StateStorage } from "zustand/middleware";

// Backend de persistência dos stores locais com namespace por usuário. A chave
// real gravada no AsyncStorage é `${name}:${userId}`, então cada conta MangaDex
// mantém sua própria estante/continue-reading/modo-de-leitura no mesmo aparelho,
// e a conta Y nunca enxerga os dados da conta X. Deslogado => namespace `anon`.
//
// O usuário ativo é uma variável de módulo atualizada pelo AuthContext em cada
// login/logout/restore, seguida de `rehydrateUserStores()` (ver rehydrateStores).

let activeUserId: string | null = null;

export function setActiveUser(userId: string | null): void {
  activeUserId = userId;
}

export function getActiveUser(): string | null {
  return activeUserId;
}

function scopedKey(name: string): string {
  return `${name}:${activeUserId ?? "anon"}`;
}

export const userScopedStorage: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(scopedKey(name)),
  setItem: (name, value) => AsyncStorage.setItem(scopedKey(name), value),
  removeItem: (name) => AsyncStorage.removeItem(scopedKey(name)),
};
