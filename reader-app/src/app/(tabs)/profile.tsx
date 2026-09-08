import { Alert, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "@react-native-vector-icons/material-design-icons";
import AppText from "@/components/AppText";
import Button from "@/components/ui/Button";
import { useAuth } from "@/store/AuthContext";
import { useSync } from "@/store/SyncContext";

function formatLastSynced(at: number | null): string {
  if (!at) return "ainda não sincronizado";
  const diffMin = Math.floor((Date.now() - at) / 60000);
  if (diffMin < 1) return "agora mesmo";
  if (diffMin < 60) return `há ${diffMin} min`;
  return new Date(at).toLocaleString("pt-BR");
}

export default function ProfileScreen() {
  const { username, logout } = useAuth();
  const { syncing, lastSyncedAt, syncNow } = useSync();

  function confirmLogout() {
    Alert.alert(
      "Sair da conta",
      "Você precisará entrar novamente com suas credenciais MangaDex. Seus dados salvos neste aparelho serão mantidos.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            void logout();
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView className="flex-1" edges={["top"]}>
      <View className="flex-1 px-6">
        <AppText text="Perfil" size="title" className="mb-8 mt-8" />

        <View className="flex-row items-center gap-4 rounded-xl bg-black/20 p-4">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-callout/20">
            <Icon name="account" size={26} color="#AD89FF" />
          </View>
          <View className="flex-1">
            <AppText
              text="Conectado como"
              size="xs"
              className="text-white/50"
            />
            <AppText
              text={username ?? "—"}
              size="text"
              className="font-semibold"
            />
          </View>
        </View>

        {/* Backup na nuvem (automático, atrelado à conta MangaDex) */}
        <View className="mt-4 rounded-xl bg-black/20 p-4">
          <View className="flex-row items-center gap-3">
            <Icon name="cloud-check-outline" size={22} color="#AD89FF" />
            <AppText
              text="Backup na nuvem"
              size="text"
              className="font-semibold"
            />
          </View>

          <AppText
            text="Sua estante e progresso são salvos automaticamente na sua conta. Ao entrar em outro aparelho, seus dados voltam."
            size="xs"
            className="mt-2 text-white/50"
          />
          <AppText
            text={
              syncing
                ? "Sincronizando…"
                : `Última sincronização: ${formatLastSynced(lastSyncedAt)}`
            }
            size="xs"
            className="mt-1 text-white/50"
          />
          <View className="mt-4">
            <Button
              title="Sincronizar agora"
              variant="ghost"
              icon="sync"
              onPress={() => void syncNow()}
              loading={syncing}
              className="border border-callout/40"
            />
          </View>
        </View>

        <View className="mt-auto mb-4">
          <Button
            title="Sair"
            variant="ghost"
            icon="logout"
            onPress={confirmLogout}
            className="border border-callout/40"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
