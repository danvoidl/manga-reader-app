# [1.3.0-beta.2](https://github.com/danvoidl/Manga_Reader/compare/v1.3.0-beta.1...v1.3.0-beta.2) (2026-09-02)


### Bug Fixes

* **api:** rodar produção via tsx (npm start) no Render em vez de node dist ([c9c3f5a](https://github.com/danvoidl/Manga_Reader/commit/c9c3f5aae85ceb2e7f2c23645490564340e3e732))

# [1.3.0-beta.1](https://github.com/danvoidl/Manga_Reader/compare/v1.2.1...v1.3.0-beta.1) (2026-09-02)


### Features

* **api:** backend de sync em Postgres + limpeza e padronização de JSDoc ([5851fe9](https://github.com/danvoidl/Manga_Reader/commit/5851fe9835e39c90b7bf0923885db35ea85bcd6b))

## [1.2.1](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0...v1.2.1) (2026-09-01)


### Bug Fixes

* mover setup-java para depois do prebuild no build Android ([d114b68](https://github.com/danvoidl/Manga_Reader/commit/d114b684ff8d4b258e7705ab01718521d80a946a))

# [1.2.0](https://github.com/danvoidl/Manga_Reader/compare/v1.1.0...v1.2.0) (2026-09-01)


### Bug Fixes

* **#1:** solved return to last page in current reading ([1b65d4d](https://github.com/danvoidl/Manga_Reader/commit/1b65d4d2c9383f252feadf80cacb2c547fb3f627)), closes [#1](https://github.com/danvoidl/Manga_Reader/issues/1)
* **api:** run api with tsx in production to resolve ESM/path-alias imports ([4ce5a1a](https://github.com/danvoidl/Manga_Reader/commit/4ce5a1a5b1b8758944446b224cc24e63a8729686))


### Features

* **#3, #12:** gate de login, requests com token do usuário e backup automático dos dados locais ([d98ffce](https://github.com/danvoidl/Manga_Reader/commit/d98ffce2f789d603c7586ae257eb81c9420486b6)), closes [#3](https://github.com/danvoidl/Manga_Reader/issues/3) [#12](https://github.com/danvoidl/Manga_Reader/issues/12)
* **#5:** added explore filter by genre and ordenation ([2aaf7b2](https://github.com/danvoidl/Manga_Reader/commit/2aaf7b21179cdfc32bc5bb341368df6a33dd2e38)), closes [#5](https://github.com/danvoidl/Manga_Reader/issues/5)
* added skeletons and other minor changes ([34fd462](https://github.com/danvoidl/Manga_Reader/commit/34fd462cca9d4b4a77d36cf471b348b2fd4f9f8f))
* added user auth ([11248e2](https://github.com/danvoidl/Manga_Reader/commit/11248e28574879ab5aa79e80a6bc87e74545dbe9))
* **api-#8:** added schema for next chapter ([276478a](https://github.com/danvoidl/Manga_Reader/commit/276478a1194c51fd9bce35a2c4f3f222da5fc8dd)), closes [api-#8](https://github.com/api-/issues/8)
* **api:** enable GraphQL introspection in production ([12f0498](https://github.com/danvoidl/Manga_Reader/commit/12f0498da22d30fb28cbc7e4fd5333d7207a5966))
* **app-#10:** add Estante tab with reading-status marking and page bookmarks ([b826799](https://github.com/danvoidl/Manga_Reader/commit/b826799afffd2f8dedf0da9e41b2e7111f243bb1)), closes [app-#10](https://github.com/app-/issues/10)
* **app-#2:** add horizontal/vertical reading modes with reader settings ([e09153d](https://github.com/danvoidl/Manga_Reader/commit/e09153d828f577a2ee8ff9f5c2005e9e91c1275b)), closes [app-#2](https://github.com/app-/issues/2)
* **app-#6:** added priority and contentRating tag to the mangas ([fe26b5a](https://github.com/danvoidl/Manga_Reader/commit/fe26b5adf7f33afb99665f8e4b4ef53706e08ba4)), closes [app-#6](https://github.com/app-/issues/6)
* **app-#8:** read next chapter ([5722748](https://github.com/danvoidl/Manga_Reader/commit/5722748ac94fb65f69bce5df8aad6d3b257af3c4)), closes [app-#8](https://github.com/app-/issues/8)
* **app-#9:** paginated chapter list with order toggle ([e8e2e96](https://github.com/danvoidl/Manga_Reader/commit/e8e2e96c72ee9af96eca65612b9c6c2ad81597cd)), closes [app-#9](https://github.com/app-/issues/9)
* **app:** home com banner de recém-avaliados, últimos capítulos e recentemente adicionados ([0c58026](https://github.com/danvoidl/Manga_Reader/commit/0c58026d3d9460ac320c5d798784c8be3e86cbe1))
* build de APK Android via GitHub Actions (workflow manual + assinatura) ([f07b161](https://github.com/danvoidl/Manga_Reader/commit/f07b1616213d1dbd4de4cbc64677fdf9058897f2))
* changes in home ([226e6b0](https://github.com/danvoidl/Manga_Reader/commit/226e6b0f52984018c8dbe5f97cd687acd82400be))
* polimento de UX (skeletons, pull-to-refresh, erro/retry, back button) + limpeza e middleware de auth ([e6ac074](https://github.com/danvoidl/Manga_Reader/commit/e6ac0746bb8f1b576c3662ef49e1a747daf14c3c))

# [1.2.0-beta.13](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.12...v1.2.0-beta.13) (2026-09-01)


### Features

* build de APK Android via GitHub Actions (workflow manual + assinatura) ([f07b161](https://github.com/danvoidl/Manga_Reader/commit/f07b1616213d1dbd4de4cbc64677fdf9058897f2))

# [1.2.0-beta.12](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.11...v1.2.0-beta.12) (2026-09-01)


### Features

* added skeletons and other minor changes ([34fd462](https://github.com/danvoidl/Manga_Reader/commit/34fd462cca9d4b4a77d36cf471b348b2fd4f9f8f))

# [1.2.0-beta.11](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.10...v1.2.0-beta.11) (2026-08-30)


### Features

* polimento de UX (skeletons, pull-to-refresh, erro/retry, back button) + limpeza e middleware de auth ([e6ac074](https://github.com/danvoidl/Manga_Reader/commit/e6ac0746bb8f1b576c3662ef49e1a747daf14c3c))

# [1.2.0-beta.10](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.9...v1.2.0-beta.10) (2026-08-28)


### Features

* **#3, #12:** gate de login, requests com token do usuário e backup automático dos dados locais ([d98ffce](https://github.com/danvoidl/Manga_Reader/commit/d98ffce2f789d603c7586ae257eb81c9420486b6)), closes [#3](https://github.com/danvoidl/Manga_Reader/issues/3) [#12](https://github.com/danvoidl/Manga_Reader/issues/12)

# [1.2.0-beta.9](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.8...v1.2.0-beta.9) (2026-08-27)


### Features

* added user auth ([11248e2](https://github.com/danvoidl/Manga_Reader/commit/11248e28574879ab5aa79e80a6bc87e74545dbe9))

# [1.2.0-beta.8](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.7...v1.2.0-beta.8) (2026-08-17)


### Features

* **app:** home com banner de recém-avaliados, últimos capítulos e recentemente adicionados ([0c58026](https://github.com/danvoidl/Manga_Reader/commit/0c58026d3d9460ac320c5d798784c8be3e86cbe1))

# [1.2.0-beta.7](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.6...v1.2.0-beta.7) (2026-08-17)


### Features

* changes in home ([226e6b0](https://github.com/danvoidl/Manga_Reader/commit/226e6b0f52984018c8dbe5f97cd687acd82400be))

# [1.2.0-beta.6](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.5...v1.2.0-beta.6) (2026-08-17)


### Features

* **app-#2:** add horizontal/vertical reading modes with reader settings ([e09153d](https://github.com/danvoidl/Manga_Reader/commit/e09153d828f577a2ee8ff9f5c2005e9e91c1275b)), closes [app-#2](https://github.com/app-/issues/2)

# [1.2.0-beta.5](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.4...v1.2.0-beta.5) (2026-08-17)


### Features

* **app-#10:** add Estante tab with reading-status marking and page bookmarks ([b826799](https://github.com/danvoidl/Manga_Reader/commit/b826799afffd2f8dedf0da9e41b2e7111f243bb1)), closes [app-#10](https://github.com/app-/issues/10)

# [1.2.0-beta.4](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.3...v1.2.0-beta.4) (2026-08-17)


### Features

* **app-#9:** paginated chapter list with order toggle ([e8e2e96](https://github.com/danvoidl/Manga_Reader/commit/e8e2e96c72ee9af96eca65612b9c6c2ad81597cd)), closes [app-#9](https://github.com/app-/issues/9)

# [1.2.0-beta.3](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.2...v1.2.0-beta.3) (2026-08-07)


### Features

* **app-#6:** added priority and contentRating tag to the mangas ([fe26b5a](https://github.com/danvoidl/Manga_Reader/commit/fe26b5adf7f33afb99665f8e4b4ef53706e08ba4)), closes [app-#6](https://github.com/app-/issues/6)

# [1.2.0-beta.2](https://github.com/danvoidl/Manga_Reader/compare/v1.2.0-beta.1...v1.2.0-beta.2) (2026-08-07)


### Features

* **api:** enable GraphQL introspection in production ([12f0498](https://github.com/danvoidl/Manga_Reader/commit/12f0498da22d30fb28cbc7e4fd5333d7207a5966))

# [1.2.0-beta.1](https://github.com/danvoidl/Manga_Reader/compare/v1.1.0...v1.2.0-beta.1) (2026-08-07)


### Bug Fixes

* **#1:** solved return to last page in current reading ([1b65d4d](https://github.com/danvoidl/Manga_Reader/commit/1b65d4d2c9383f252feadf80cacb2c547fb3f627)), closes [#1](https://github.com/danvoidl/Manga_Reader/issues/1)
* **api:** run api with tsx in production to resolve ESM/path-alias imports ([4ce5a1a](https://github.com/danvoidl/Manga_Reader/commit/4ce5a1a5b1b8758944446b224cc24e63a8729686))


### Features

* **#5:** added explore filter by genre and ordenation ([2aaf7b2](https://github.com/danvoidl/Manga_Reader/commit/2aaf7b21179cdfc32bc5bb341368df6a33dd2e38)), closes [#5](https://github.com/danvoidl/Manga_Reader/issues/5)
* **api-#8:** added schema for next chapter ([276478a](https://github.com/danvoidl/Manga_Reader/commit/276478a1194c51fd9bce35a2c4f3f222da5fc8dd)), closes [api-#8](https://github.com/api-/issues/8)
* **app-#8:** read next chapter ([5722748](https://github.com/danvoidl/Manga_Reader/commit/5722748ac94fb65f69bce5df8aad6d3b257af3c4)), closes [app-#8](https://github.com/app-/issues/8)
