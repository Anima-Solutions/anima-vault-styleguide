# Ânima Vault: fork do `passbolt_styleguide`

Fork **só visual** do [passbolt/passbolt_styleguide](https://github.com/passbolt/passbolt_styleguide) (AGPL-3.0) com a marca Ânima Vault.
Criptografia, autenticação, chamadas de API e lógica de negócio **não são alteradas**.

A orquestração (sync do Design System, geração de assets, textos de marca, build, imagem do servidor e atualização a partir do upstream) fica em [Anima-Solutions/anima-vault](https://github.com/Anima-Solutions/anima-vault). Este README cobre só o que existe **dentro** deste fork.

- Branch: `anima/v5.x`, rebaseada sobre as tags do upstream (`upstream` = passbolt, com push desativado).
- Commits do fork começam com `[anima]`.

## Camada de tema

| Caminho | O que é | Mantido por |
|---|---|---|
| `src/less/anima/ds/tokens.css` | Tokens do Ânima Design System (o `.dark` foi promovido a `:root`, porque o Vault é só-escuro) | **Gerado** por `anima-vault/scripts/sync-ds.mjs` |
| `src/less/anima/ds/fonts.less` | `@font-face` da Inter Variable (opsz) | **Gerado** |
| `src/less/anima/ds/VERSION` | Versão do DS sincronizada | **Gerado** |
| `src/fonts/anima/` | woff2 da Inter + `OFL.txt` | **Gerado** |
| `src/less/anima/colors.less` | Tokens do DS → variáveis do Passbolt (paleta do Midgar + ~80 variáveis semânticas + raios) | À mão |
| `src/less/anima/overrides.less` | Tipografia e elevação (sobreposição, sem editar arquivos base) | À mão |
| `src/less/anima/anima.less` | Junta tudo; importado no fim de cada entrada do tema | À mão |
| `src/less/themes/anima/*.less` | Entradas do tema: cópia das do Midgar + `@import "../../anima/anima.less"` | À mão |
| `config/anima/copyAnimaTheme.js` | Plugin de webpack: publica `css/themes/anima/*` por cima de **todas** as pastas de tema | À mão |

**Tema único:** a extensão e o servidor carregam `css/themes/<tema do usuário>/…`. Como o plugin escreve o CSS Ânima em todas as pastas (default, midgar, solarized_*, sakura, layette e qualquer tema novo do upstream), qualquer preferência cai no tema Ânima. Não há patch nas whitelists de tema.

## Assets substituídos (mesmos nomes do upstream)

Gerados por `anima-vault/scripts/build-assets.sh`. **Não edite à mão.**

- `src/img/logo/*`: ícones da extensão (normal, inativo, badges), `logo*.svg`/`logo*.png`.
- `src/img/svg/logo.svg` (componente SVGR do cabeçalho, importado por ~15 componentes) e `src/img/svg/passbolt.svg`.
- `src/img/svg/*` (190 ícones de UI): Lucide → **Phosphor bold** (o padrão do DS), gerados por `anima-vault/scripts/build-icons.mjs` a partir de `anima-vault/brand/icons.json`. Mesmos nomes, largura e altura; cor via `var(--icon-color)` e estado preenchido via `var(--icon-background-color)`, como no upstream. Animações, ilustrações e imagens de produto (21 arquivos, lista `keep`) não mudam. Nos testes os SVGs são mocks (`test/mocks/svg.js`). Um ícone novo no upstream faz o script falhar até ser mapeado.

> O logo "Ânima Vault" é **TEMPORÁRIO**: o logotipo Ânima + "Vault" em Inter, até o DS publicar o logo oficial da solução.

## Arquivos do upstream alterados (patches)

Cada linha alterada está marcada com `[anima]`. Num conflito de rebase, reaplique a intenção descrita aqui.

| Arquivo | Mudança | Por quê |
|---|---|---|
| `config/webpack.less.js` | `THEMES.push("anima")` (linha nova, não altera a lista) | Compila o tema `anima` |
| `webpack.config.js` | Adiciona o plugin `config/anima/copyAnimaTheme.js` | Tema único |
| `src/react-extension/components/UserSetting/NavigateIntoUserSettingsWorkspace/NavigateIntoUserSettingsWorkspace.js` | `canIUseThemeCapability` retorna `false` | Esconde o seletor de tema (só existe o tema escuro). O plugin `accountSettings` do servidor **não** pode ser desligado: ele também guarda idioma e MFA. |
| `src/react-extension/components/Common/Navigation/Header/Logo.js` | `title` e `<h1>` com "Ânima Vault" | Nome do produto (texto fixo, fora do i18n) |
| `src/react-extension/components/Common/Footer/Footer.js` | Novo item no fim: "Baseado no Passbolt (AGPL-3.0) · Código-fonte" | Oferta de código-fonte da AGPL §13. O link de créditos do upstream (coração) continua. |

## Textos (i18n)

`src/locales/**` **nunca** é alterado no git. O nome do produto é aplicado no **empacotamento**, depois dos testes, por `anima-vault/scripts/brand-strings.mjs`. Motivos:
- os testes do upstream renderizam a UI em en-UK e conferem textos com "passbolt";
- o Crowdin reescreve esses arquivos a cada release.

## Testes

Critério: **zero falhas** nos testes do upstream. Linha de base: v5.18.2, 8745 testes.
Rode **um repositório por vez**, num container com limite de memória (rodar sem limite já derrubou o WSL):

```bash
docker run --rm --memory=6g --cpus=4 -u "$(id -u):$(id -g)" -e HOME=/tmp -e TZ=UTC \
  -v "$PWD":/w -w /w node:24 bash -c 'npx eslint src config/anima --max-warnings 0 && npx jest --no-cache --runInBand --silent ./src'
```

## Licença e marca

O código continua sob **AGPL-3.0** (ver `LICENSE`). "Passbolt" é marca registrada da Passbolt SA, e este fork remove a marca da interface, mantendo apenas a atribuição legal. A marca, os logos e o nome **Ânima Vault** são da Ânima e **não** são licenciados pela AGPL. A fonte Inter é distribuída sob a SIL OFL 1.1 (`src/fonts/anima/OFL.txt`).
