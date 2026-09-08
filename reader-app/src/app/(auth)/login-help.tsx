import { Linking, Pressable, ScrollView, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Icon from '@react-native-vector-icons/material-design-icons'
import AppText from '@/components/AppText'

const SETTINGS_URL = 'https://mangadex.org/settings'

const STEPS = [
  'Acesse mangadex.org/settings já logado na sua conta.',
  'Abra a seção “API Clients” e solicite um novo client pessoal.',
  'Aguarde a aprovação (pode ser automática ou manual da equipe da MangaDex).',
  'Quando aprovado, copie o Client ID (formato personal-client-...).',
  'Clique em “Get Secret” para revelar o Client Secret e copie-o.'
]

function Step({ index, text }: { index: number; text: string }) {
  return (
    <View className="mb-4 flex-row gap-3">
      <View className="h-6 w-6 items-center justify-center rounded-full bg-callout">
        <AppText
          text={String(index + 1)}
          size="xs"
          className="font-bold text-default-black"
        />
      </View>
      <AppText
        text={text}
        size="sub"
        className="flex-1 text-white/80 leading-5"
      />
    </View>
  )
}

export default function LoginHelpScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1" edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        className="px-6"
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="mb-6 mt-2"
          accessibilityLabel="Voltar"
        >
          <Icon name="arrow-left" size={26} color="#AD89FF" />
        </Pressable>

        <AppText text="Como obter seu secret" size="title" className="mb-2" />
        <AppText
          text="O Client Secret vem de um “personal API client” criado na sua própria conta MangaDex."
          size="sub"
          className="mb-8 text-white/60 leading-5"
        />

        <View className="mb-8">
          {STEPS.map((text, index) => (
            <Step key={index} index={index} text={text} />
          ))}
        </View>

        <Pressable
          onPress={() => Linking.openURL(SETTINGS_URL)}
          className="mb-8 h-12 flex-row items-center justify-center gap-2 rounded-lg bg-[#3F3F3F] px-4"
        >
          <Icon name="open-in-new" size={20} color="#AD89FF" />
          <AppText
            text="Abrir mangadex.org/settings"
            className="font-semibold text-callout"
          />
        </Pressable>

        <View className="rounded-lg bg-[#3F3F3F] p-4">
          <View className="mb-2 flex-row items-center gap-2">
            <Icon name="shield-lock-outline" size={20} color="#AD89FF" />
            <AppText text="Sua privacidade" className="font-semibold" />
          </View>
          <AppText
            text="Seu usuário, senha e secret são usados apenas para autenticar direto na MangaDex, a partir deste aparelho. O secret fica guardado com segurança no próprio celular (Keychain no iOS / Keystore no Android). Essas credenciais não são enviadas para o desenvolvedor do app nem para terceiros."
            size="sub"
            className="text-white/70 leading-5"
          />
          <AppText
            text="Sua estante e progresso de leitura são salvos no servidor do app (vinculados à sua conta MangaDex) para backup e sincronização entre aparelhos. Esses dados não incluem suas credenciais."
            size="sub"
            className="mt-3 text-white/70 leading-5"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
