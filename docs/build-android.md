# Gerar o APK Android pelo GitHub Actions

O build pesado (Gradle, ~20 min) roda nos runners do GitHub, **não na sua máquina**.
Você dispara manualmente e baixa o APK como artifact.

- Workflow: [`.github/workflows/build-android.yml`](../.github/workflows/build-android.yml)
- Assinatura: [`reader-app/plugins/withReleaseSigning.js`](../reader-app/plugins/withReleaseSigning.js)
  injeta a `signingConfig release` durante o `expo prebuild`.

## Setup único (só na primeira vez)

### 1. Obter a keystore de assinatura

Você precisa de **uma** keystore. Como o projeto já usa EAS, o recomendado é
**reutilizar a keystore que o EAS já gerou** — assim os APKs feitos pelo GitHub e
qualquer build feito pelo EAS compartilham a mesma assinatura e instalam por cima um do
outro. Gerar uma keystore nova com `keytool` cria uma identidade **diferente** da do EAS,
e os dois APKs passam a brigar entre si (só instala um por cima do outro depois de
desinstalar). Prefira a Opção A.

#### Opção A — Baixar a keystore existente do EAS (recomendado)

No `reader-app/`:

```bash
eas credentials
```

No menu: **Android** → escolha o build profile (ex.: `production`) → **Keystore: Manage
everything needed to build your project** → **Download existing keystore**.

Isso baixa um arquivo `.jks` e **mostra na tela** os valores que viram secrets:

- _Keystore password_ → `ANDROID_KEYSTORE_PASSWORD`
- _Key alias_ → `ANDROID_KEY_ALIAS` (um valor tipo `a1b2c3…`, **não** `manga-upload` —
  use exatamente o que o EAS mostrar)
- _Key password_ → `ANDROID_KEY_PASSWORD`

> O plugin e o workflow não dependem do alias ser `manga-upload`; leem tudo dos secrets.

#### Opção B — Gerar uma nova com keytool (só se você NÃO tiver keystore no EAS)

**Guarde bem o arquivo e as senhas — perder a keystore impede atualizar o app por cima
no futuro, obrigando os usuários a desinstalar.**

```bash
keytool -genkeypair -v -keystore release.keystore -alias manga-upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Aqui o alias é `manga-upload` e você define as senhas da store e da key.

### 2. Gerar o Base64 da keystore

Aponte pro arquivo que você obteve no passo 1 (o `.jks` do EAS **ou** o
`release.keystore` do keytool):

```bash
base64 -w0 caminho/para/sua-keystore.jks
```

Copie a saída inteira (uma linha só) — vai virar o secret `ANDROID_KEYSTORE_BASE64`.

### 3. Cadastrar os secrets no repositório

Em **Settings → Secrets and variables → Actions → New repository secret**, crie:

| Nome                       | Valor                                                            |
| -------------------------- | ---------------------------------------------------------------- |
| `ANDROID_KEYSTORE_BASE64`  | a string base64 do passo 2                                       |
| `ANDROID_KEYSTORE_PASSWORD`| a senha da store (o que o EAS mostrou, ou a que você definiu)    |
| `ANDROID_KEY_ALIAS`        | o alias (do EAS: `a1b2c3…`; do keytool: `manga-upload`)          |
| `ANDROID_KEY_PASSWORD`     | a senha da key (o que o EAS mostrou, ou a que você definiu)      |
| `EXPO_PUBLIC_API_URL`      | a URL **pública** da API GraphQL (ex.: `https://api.seudominio`) |

> **Importante:** `EXPO_PUBLIC_API_URL` precisa apontar pra uma API acessível pela
> internet. O default (`http://localhost:4000`) só funciona em emulador/dev — num
> celular real o app não carrega os mangás. Se a API (`api/`) ainda não estiver
> hospedada, hospede-a antes (ou o APK abre mas fica sem dados).

Guarde `release.keystore` num lugar seguro (gerenciador de senhas / backup). Ela **não**
é commitada — `*.jks` e a própria keystore ficam fora do git.

## Gerar um APK

1. Vá em **Actions → Build Android APK → Run workflow**.
2. Escolha a branch e (opcional) preencha o campo _note_.
3. Clique em **Run workflow** e aguarde (~15–25 min).
4. Ao terminar (job verde), abra o run e baixe o artifact
   **`hokusai-manga-v<versão>-<número>`** — dentro dele está o
   `hokusai-manga-v<versão>.apk` (a `<versão>` vem de `reader-app/package.json`, o bump
   feito pelo semantic-release; o `<número>` é o run do Actions, só pra diferenciar
   rebuilds da mesma versão).
5. Instale no aparelho: transfira o arquivo e abra, ou via cabo:
   ```bash
   adb install -r hokusai-manga-v<versão>.apk
   ```

Além do artifact do run (temporário, 30 dias), o workflow **anexa o mesmo APK à GitHub
Release da versão** (tag `v<versão>`, criada pelo semantic-release) — é o jeito mais
permanente de baixar, direto na aba **Releases**. Se você rebuildar a mesma versão, o
asset é sobrescrito (`--clobber`).

> A release da versão precisa **já existir** quando o build roda. O `release.yml`
> (semantic-release) cria a tag/release ao dar push na branch; se você disparar o
> build-android antes disso, o passo de anexar falha porque não há release `v<versão>`.
> Rode o build depois que a release da versão estiver publicada.

Builds sucessivos usam a mesma keystore, então o APK novo instala **por cima** do
anterior sem precisar desinstalar.

## Observações

- O aviso do Gradle _"Deprecated Gradle features were used… incompatible with Gradle 10"_
  é **inofensivo** — vem dos plugins do Expo/RN, não do projeto. `BUILD SUCCESSFUL` é o
  que importa.
- `versionCode`/`version` vêm do [`reader-app/app.json`](../reader-app/app.json). Para
  builds de teste manuais está ok; se quiser numerar automaticamente por build, dá pra
  derivar o `versionCode` de `github.run_number` num incremento futuro.
- O build local `expo run:android` continua usando a debug keystore normalmente — o
  plugin só ativa a keystore de release quando as propriedades `MANGA_UPLOAD_*` existem
  (o que só acontece no CI).
