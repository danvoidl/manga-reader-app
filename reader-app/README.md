# Hokusai Manga — App (reader-app)

App Expo / React Native (o cliente) do leitor de mangás. Consome o servidor GraphQL em
[`../api`](../api/README.md) e autentica cada usuário com a própria conta da MangaDex.

Stack: Expo SDK 57 (Expo Router), React Native 0.86, NativeWind v4, Zustand,
TanStack Query, GraphQL (camada própria, sem Apollo Client). Gerenciador de pacotes:
**bun**.

> Pré-requisito: a [API](../api/README.md) precisa estar acessível (local ou hospedada)
> e apontada em `EXPO_PUBLIC_API_URL`. O app usa `expo-dev-client`, então roda em um
> **dev build** próprio (não no Expo Go).

## Pré-requisitos

- [Bun](https://bun.sh)
- Toolchain nativa para dev build: Android Studio (Android) e/ou Xcode (iOS, só em macOS)
- Um dispositivo/emulador com um **dev build** instalado (ver abaixo)

## Rodar em desenvolvimento

```bash
bun install
bun start          # inicia o Metro / servidor de dev do Expo
```

Depois abra o app no dev build do dispositivo, ou dispare a compilação nativa:

```bash
bun android        # expo run:android  (compila + instala no Android)
bun ios            # expo run:ios       (compila + instala no iOS, só macOS)
bun web            # roda no navegador (SecureStore não existe na web — login não persiste)
```

Outros scripts:

```bash
bun run lint       # ESLint (eslint-config-expo + Prettier)
```

> Não há test runner configurado neste pacote.

### Atenção ao host da API (`EXPO_PUBLIC_API_URL`)

O endereço `localhost` significa coisas diferentes conforme onde o app roda:

| Onde o app roda        | Valor de `EXPO_PUBLIC_API_URL`         |
| ---------------------- | -------------------------------------- |
| iOS simulator / web    | `http://localhost:4000`                |
| Emulador Android       | `http://10.0.2.2:4000`                 |
| Aparelho físico        | `http://<IP-da-sua-máquina>:4000`      |
| API hospedada          | a URL pública (ex.: `https://...`)     |

## Variáveis de ambiente

Ficam em `reader-app/.env` (git-ignored). Como são lidas pelo Expo, **todas usam o
prefixo `EXPO_PUBLIC_`** e são embutidas no bundle em build time.

| Variável                        | Obrigatória | Descrição                                                                                 |
| ------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`           | Sim         | URL raiz do servidor GraphQL (a [API](../api/README.md)). Default no código: `http://localhost:4000`. |
| `EXPO_PUBLIC_MANGADEX_AUTH_URL` | Sim         | Endpoint de token OAuth da MangaDex (login/refresh vão direto para lá). Default no código já é o valor correto. |
| `EXPO_PUBLIC_COVER_API_URL`     | Sim         | Base das imagens de capa da MangaDex (ex.: `https://uploads.mangadex.org/covers`).        |

Exemplo de `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:4000
EXPO_PUBLIC_MANGADEX_AUTH_URL=https://auth.mangadex.org/realms/mangadex/protocol/openid-connect/token
EXPO_PUBLIC_COVER_API_URL=https://uploads.mangadex.org/covers
```

Variáveis extras usadas **apenas pelo codegen** (não pelo app), ver seção abaixo:
`CODEGEN_SCHEMA_URL`, `CODEGEN_AUTH_TOKEN`.

## Gerar tipos do GraphQL (codegen)

Os tipos e documentos tipados do GraphQL são gerados em `src/gql/` a partir do schema
da API — introspectado **via HTTP** (o codegen não lê arquivos `.graphql` locais, ele
consulta o servidor). Config em [`codegen.ts`](codegen.ts).

```bash
bun run codegen         # gera uma vez
bun run codegen:watch   # regenera ao salvar
```

De onde ele lê o schema (ordem de resolução):

1. `CODEGEN_SCHEMA_URL` — override explícito só para o codegen
2. `EXPO_PUBLIC_API_URL` — a mesma API que o app usa
3. `http://localhost:4000` — o servidor Apollo local

**Token para o codegen:** a API exige um bearer token em toda operação, exceto a
introspection query que ela reconhece **pelo `operationName`** — que o loader do codegen
não envia. Por isso, passe um token qualquer em `CODEGEN_AUTH_TOKEN` para a introspection
passar pelo gate de auth (o valor é irrelevante: a introspection nunca chega aos
resolvers upstream). O `codegen.ts` carrega o `.env` automaticamente.

```bash
# Rodando contra a API local (precisa dela no ar) + token de fachada:
CODEGEN_AUTH_TOKEN=whatever bun run codegen

# Ou contra a API hospedada:
CODEGEN_SCHEMA_URL=https://mangadexreader-api.onrender.com CODEGEN_AUTH_TOKEN=whatever bun run codegen
```

## Build

### Build de desenvolvimento (dev client)

Para iterar no dia a dia com `bun start`, você precisa de um dev build instalado no
dispositivo. Gere-o localmente (`bun android` / `bun ios`) ou pelo EAS:

```bash
eas build --profile development --platform android
```

Perfis de build em [`eas.json`](eas.json): `development`, `preview`, `production`.
`appVersionSource` é `remote` (o EAS controla o `versionCode`/build number).

### Build de release local (APK Android sem EAS)

O plugin [`plugins/withReleaseSigning.js`](plugins/withReleaseSigning.js) injeta a
`signingConfig release` durante o `expo prebuild`, ativada só quando as propriedades de
assinatura existem (o que acontece no CI). O caminho recomendado para gerar o APK é pelo
GitHub Actions — passo a passo completo (keystore, secrets, download do artifact) em
[`../docs/build-android.md`](../docs/build-android.md).

> O `bun android` (dev build local) continua usando a debug keystore normalmente; a
> keystore de release só entra quando as variáveis `MANGA_UPLOAD_*` estão presentes (CI).

## Estrutura (resumo)

Roteamento por arquivos com Expo Router em `src/app/`. Detalhes da arquitetura (data
layer GraphQL, autenticação, stores por usuário e sync na nuvem) estão documentados no
[CLAUDE.md](../CLAUDE.md) da raiz.
