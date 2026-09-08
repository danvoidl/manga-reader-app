# Hokusai Manga

Um leitor de mangás para celular (Android/iOS), em português, que busca os títulos
direto do catálogo da [MangaDex](https://mangadex.org). O objetivo é ler mangá de
forma simples e organizada, com a sua conta e o seu progresso guardados na nuvem.

## Como o aplicativo funciona (visão geral)

Pense no app como duas peças que conversam entre si:

- **O aplicativo** (a tela que você usa no celular) — mostra as capas, as páginas e
  controla a leitura.
- **A API** (um servidor nosso na internet) — é o intermediário que fala com a
  MangaDex e devolve para o app só o que ele precisa, já organizado.

Quando você abre um mangá, o app pede à nossa API, a API pergunta à MangaDex, e a
resposta volta pela mesma trilha até a sua tela.

### Entrar no app

Você faz login com a **sua própria conta da MangaDex** (mais precisamente, com uma
"chave de acesso" que você gera lá na MangaDex — o passo a passo aparece na tela de
ajuda do login). Duas garantias importantes:

- A sua **senha/segredo nunca sai do celular**. O app conversa direto com a MangaDex
  para se autenticar; a nossa API só recebe um "crachá temporário" que prova quem é
  você, e nada mais.
- Sem login, o app não abre — é obrigatório entrar para usar.

### O que dá para fazer

- **Início** — trilhos de destaques: últimas atualizações, adicionados recentemente e
  mais bem avaliados, além de fileiras por gênero.
- **Explorar** — busca e navegação pelo catálogo.
- **Estante** — os mangás que você acompanha, com o status de leitura de cada um.
- **Leitor** — leitura página a página, com zoom e barra de progresso.
- **Continuar lendo** — o app lembra de onde você parou.
- **Perfil** — sair da conta e ver/forçar a sincronização.

### Onde ficam os seus dados

O que você lê, sua estante e seu progresso ficam guardados **no seu celular** e são
**sincronizados automaticamente na nuvem** (no nosso servidor). Assim, se você trocar
de aparelho ou reinstalar o app, é só entrar de novo com a sua conta MangaDex que tudo
volta. Cada conta enxerga apenas os próprios dados, mesmo que várias pessoas usem o
mesmo celular.

## Estrutura do projeto

Este repositório reúne as duas peças acima:

| Pasta          | O que é                                    | Como rodar / detalhes                       |
| -------------- | ------------------------------------------ | ------------------------------------------- |
| [`reader-app/`](reader-app/README.md) | O app Expo / React Native (o cliente)      | Veja o [README do app](reader-app/README.md) |
| [`api/`](api/README.md)        | O servidor GraphQL que fala com a MangaDex | Veja o [README da API](api/README.md)        |

Para colocar o projeto para rodar, o app precisa de uma API no ar. Comece pela
[API](api/README.md) e depois vá para o [app](reader-app/README.md).

Documentação adicional:

- [Gerar o APK Android pelo GitHub Actions](docs/build-android.md)
- [CLAUDE.md](CLAUDE.md) — guia técnico detalhado da arquitetura (para desenvolvedores).
