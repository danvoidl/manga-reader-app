// Expo config plugin: injeta uma signingConfig `release` no android/app/build.gradle
// gerado pelo prebuild. Como o android/ é regenerado a cada build (CNG), a assinatura
// precisa ser reaplicada em todo prebuild — por isso é um plugin, e não uma edição
// manual no build.gradle.
//
// A keystore só é usada quando a propriedade Gradle `MANGA_UPLOAD_STORE_FILE` existe
// (definida pelo CI via -P). Sem ela, o build local de desenvolvimento continua caindo
// na debug keystore normalmente — nada muda pra quem roda `expo run:android`.
//
// Propriedades esperadas (passadas pelo workflow):
//   MANGA_UPLOAD_STORE_FILE, MANGA_UPLOAD_STORE_PASSWORD,
//   MANGA_UPLOAD_KEY_ALIAS, MANGA_UPLOAD_KEY_PASSWORD

const { withAppBuildGradle } = require('@expo/config-plugins')

const RELEASE_SIGNING_CONFIG = `        release {
            if (project.hasProperty('MANGA_UPLOAD_STORE_FILE')) {
                storeFile file(MANGA_UPLOAD_STORE_FILE)
                storePassword MANGA_UPLOAD_STORE_PASSWORD
                keyAlias MANGA_UPLOAD_KEY_ALIAS
                keyPassword MANGA_UPLOAD_KEY_PASSWORD
            }
        }
`

// Fecha o bloco `debug { ... }` dentro de `signingConfigs`. keyPassword 'android' só
// aparece nessa signingConfig, então é uma âncora segura.
const DEBUG_SIGNING_BLOCK_END = `            keyPassword 'android'
        }
`

// Linha do release buildType que aponta pra debug keystore (precedida pelo comentário
// da template, o que a distingue da linha idêntica no debug buildType).
const RELEASE_BUILDTYPE_SIGNING = `            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`

function applyReleaseSigning(contents) {
  if (contents.includes('MANGA_UPLOAD_STORE_FILE')) {
    // Já aplicado (idempotente).
    return contents
  }

  if (!contents.includes(DEBUG_SIGNING_BLOCK_END)) {
    throw new Error(
      '[withReleaseSigning] Não encontrei o bloco debug signingConfig esperado — a template do Expo/RN pode ter mudado.'
    )
  }
  contents = contents.replace(
    DEBUG_SIGNING_BLOCK_END,
    DEBUG_SIGNING_BLOCK_END + RELEASE_SIGNING_CONFIG
  )

  if (!contents.includes(RELEASE_BUILDTYPE_SIGNING)) {
    throw new Error(
      '[withReleaseSigning] Não encontrei o signingConfig do release buildType esperado.'
    )
  }
  contents = contents.replace(
    RELEASE_BUILDTYPE_SIGNING,
    `            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig project.hasProperty('MANGA_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug`
  )

  return contents
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    if (cfg.modResults.language !== 'groovy') {
      throw new Error(
        '[withReleaseSigning] build.gradle não é Groovy; plugin não aplicado.'
      )
    }
    cfg.modResults.contents = applyReleaseSigning(cfg.modResults.contents)
    return cfg
  })
}
