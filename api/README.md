# Hokusai Manga — API

Servidor GraphQL (Apollo standalone) que funciona como intermediário entre o
[app](../reader-app/README.md) e a API REST da [MangaDex](https://api.mangadex.org/docs/).
Ele também guarda o backup/sincronização de cada usuário em um Postgres.

Stack: Apollo Server 4 (standalone), `graphql-tools`, `ofetch`, `jose` (verificação de
token), `pg`. Roda em **ESM** via `tsx`. Gerenciador de pacotes: **npm**.

## Como funciona (resumo)

- **Sem conta própria do servidor.** A API não tem login na MangaDex. Cada requisição
  GraphQL precisa trazer o **access token do usuário logado** (o app o encaminha em
  `Authorization: Bearer <token>`). A API repassa esse token para a MangaDex, então toda
  chamada upstream roda sob a identidade daquele usuário. Um plugin rejeita qualquer
  operação sem token (`UNAUTHENTICATED` / 401), exceto a `IntrospectionQuery`.
- **Padrão repository + factory.** Acesso aos dados via `FetchFactory` (wrapper do
  `ofetch` que retorna tupla estilo Go, nunca lança) e módulos por domínio em
  `src/repository/modules/`.
- **Sync/backup por usuário.** Operações `syncPull`/`syncPush` guardam um blob JSON por
  usuário no Postgres (tabela `sync_blobs`). O dono do blob é derivado **verificando a
  assinatura** do access token contra o JWKS do Keycloak da MangaDex (`src/auth/verifyToken.ts`).

Mais detalhes de arquitetura no [CLAUDE.md](../CLAUDE.md) da raiz.

## Pré-requisitos

- Node.js 20+
- Um Postgres acessível (ex.: [Supabase](https://supabase.com) ou [Neon](https://neon.tech)) — a tabela é criada sozinha no startup (`initDb`)

## Rodar em desenvolvimento

```bash
npm install
npm run dev        # tsx watch, hot-reload, em http://localhost:4000
```

Scripts:

```bash
npm run dev        # servidor de dev com hot-reload
npm start          # roda via tsx src/index.ts (mesmo comando do Render em prod)
npm run compile    # type-check + emite dist/  (usado só como gate de type-check)
```

> **`node dist/index.js` não funciona.** O `tsc` deixa o path alias `~/*`, imports de
> diretório (`./schemas`) e imports sem extensão verbatim, e o loader ESM do Node rejeita
> os três. Sempre execute com `tsx` (`npm start` / `npm run dev`) — por isso o `compile`
> serve apenas como verificação de tipos, não como saída executável.

> Não há testes (o script `test` sai com código 1 de propósito).

## Variáveis de ambiente

Ficam em `api/.env` (git-ignored), carregadas via `dotenv` em
[`src/config.ts`](src/config.ts). O servidor **falha no startup** nomeando a variável se
uma obrigatória estiver ausente.

| Variável            | Obrigatória | Descrição                                                                              |
| ------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `BASE_URL`          | Sim         | Base da API REST da MangaDex (`https://api.mangadex.org`).                              |
| `UPLOAD_BASE_URL`   | Sim         | Base de uploads/imagens da MangaDex (`https://uploads.mangadex.org`).                   |
| `DATABASE_URL`      | Sim         | Connection string do Postgres externo (Supabase/Neon) que guarda o backup por usuário. |
| `MANGADEX_ISSUER`   | Sim         | Issuer esperado do realm Keycloak da MangaDex (valida os access tokens).               |
| `MANGADEX_JWKS_URL` | Sim         | URL do JWKS (chaves públicas) do realm, para verificar a assinatura dos tokens.        |
| `PORT`              | Não         | Porta do servidor. Default: `4000`.                                                    |

Exemplo de `.env`:

```env
BASE_URL=https://api.mangadex.org
UPLOAD_BASE_URL=https://uploads.mangadex.org
DATABASE_URL=postgres://usuario:senha@host:5432/banco
MANGADEX_ISSUER=https://auth.mangadex.org/realms/mangadex
MANGADEX_JWKS_URL=https://auth.mangadex.org/realms/mangadex/protocol/openid-connect/certs
```

> **Nunca** commite o `.env` nem exponha `DATABASE_URL` — ele contém credenciais do banco.

## Build / deploy

Não há passo de "build" que produza um executável — a produção roda o TypeScript
direto com `tsx` (`npm start`). O `npm run compile` existe só como gate de type-check.

Deploy configurado para o [Render](https://render.com) em [`render.yml`](render.yml):

- `rootDir: api`
- `buildCommand: npm install && npm run compile` (só valida tipos)
- `startCommand: npm start`
- As variáveis de ambiente da tabela acima devem ser cadastradas no painel do Render
  (`sync: false` — não vão no arquivo).

## Explorar o schema

Com o servidor no ar, abra `http://localhost:4000` no navegador para usar o Apollo
Sandbox. A introspection fica **habilitada mesmo em produção** (é o que permite ao
codegen do app ler o schema por HTTP). O GraphQL é montado em
[`src/schemas/index.ts`](src/schemas/index.ts) a partir das pastas por domínio
(`mangas/`, `manga-chapters/`, `sync/`).
