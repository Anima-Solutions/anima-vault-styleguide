/**
 * Ânima Vault: o Vault tem um único tema (escuro). Este plugin publica o CSS de `css/themes/anima/` por
 * cima de TODAS as outras pastas de tema geradas pelo build (default, midgar, solarized_*, sakura,
 * layette… e qualquer tema que o upstream acrescentar à lista THEMES).
 *
 * Assim a extensão e o servidor continuam carregando `css/themes/<tema do usuário>/…` sem patch
 * nenhum, e qualquer preferência salva (ou a do sistema operacional) cai no tema Ânima.
 *
 * Roda depois da minificação, então copia os arquivos .min.css já finais. Arquivos que só existem em
 * outros temas (ex.: default/api_webinstaller.min.css) ficam como estão.
 */
const { Compilation, sources } = require("webpack");

const PLUGIN_NAME = "AnimaCopyThemePlugin";
const THEME_ASSET = /^css\/themes\/([^/]+)\/([^/]+\.css)$/;
const SOURCE_THEME = "anima";

class AnimaCopyThemePlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: PLUGIN_NAME, stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE },
        (assets) => {
          const animaFiles = new Map();
          const themes = new Set();
          for (const name of Object.keys(assets)) {
            const match = THEME_ASSET.exec(name);
            if (!match) {
              continue;
            }
            if (match[1] === SOURCE_THEME) {
              animaFiles.set(match[2], assets[name]);
            } else {
              themes.add(match[1]);
            }
          }
          if (animaFiles.size === 0) {
            compilation.errors.push(new Error(`${PLUGIN_NAME}: nenhum css/themes/${SOURCE_THEME}/*.css foi gerado`));
            return;
          }
          for (const theme of themes) {
            for (const [file, source] of animaFiles) {
              const target = `css/themes/${theme}/${file}`;
              const copy = new sources.RawSource(source.source());
              if (compilation.getAsset(target)) {
                compilation.updateAsset(target, copy);
              } else {
                compilation.emitAsset(target, copy);
              }
            }
          }
        },
      );
    });
  }
}

module.exports = AnimaCopyThemePlugin;
