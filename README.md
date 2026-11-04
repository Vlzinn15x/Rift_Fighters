# RIFT FIGHTERS V35 — GitHub Pages

Jogo de luta 2D baseado integralmente no projeto **Rift Fighters V34** fornecido pelo usuário. Mantém os 11 lutadores, sprites, movimentos, ataques, especiais, arenas, treinamento, perfil e opções da V34. Esta é uma atualização incremental funcional, não uma recriação do zero.

## Novidades implementadas na V35

| Área | Implementação | Limitação |
| --- | --- | --- |
| Movimentação | Transição de velocidade suavizada, controles preservados | Mesmas regras de física da V34 |
| Combate | Combos, especiais, dano, hitboxes e defesas da V34 preservados; registro de dano e combo | Sem alterações de arte aos golpes existentes |
| Animações | Sprites existentes preservados; telegráficos e efeitos nos bosses; aura cosmética equipada | Sem sprites novos para os cinco bosses |
| IA | CPU leva em conta alcance, cooldown, energia, ameaça e dificuldade; ataques anunciados nos bosses | Ainda não equivale a uma IA competitiva online |
| Campanha | 5 chefões sequenciais, 3 fases de agressividade por chefe, desbloqueio e recompensa da primeira vitória | Chefões usam lutadores e sprites já existentes |
| Progressão | Moedas por duelo, recompensas de campanha, compra/equipamento de 5 auras, histórico de bosses | Perfil é local ao navegador por padrão |
| Backup | Exportar/importar progresso V35 em arquivo `.json` pela aba PERFIL | Importação somente do formato V35 |
| Celular | Canvas 1× em tela de toque, controle PESADO adicionado, páginas com rolagem e melhorias de layout | É recomendável jogar em modo paisagem |
| Publicação | GitHub Actions publica a pasta `public` via GitHub Pages; Cloudflare Worker permanece opcional | Multiplayer **não funciona somente com GitHub Pages** |

**Importante:** esta atualização contém **11 personagens jogáveis** (elenco original deste ZIP). A versão mais recente de outro chat aparentava ter 14 personagens e novos sprites que **não estavam neste ZIP**. Não foram inventadas versões gráficas desses três personagens. Os 5 chefões da campanha são variações de lutadores já existentes, com HP e IA diferenciados. Os duelos solo, treinos, chefões e loja são locais; para salas online é necessário implantar um servidor Cloudflare Worker com D1.

## Instalar e publicar no GitHub Pages

1. Descompacte `RIFT_FIGHTERS_V35_GITHUB.zip` no seu computador.
2. Crie um repositório público ou privado no GitHub (por exemplo, `rift-fighters`).
3. Envie **os arquivos e as pastas de dentro de `rift-fighters-v35`** para a raiz do repositório, sem deixar tudo aninhado em uma pasta adicional. Inclua `.github`, `public`, `worker`, `tests`, `migrations`, `README.md`, `package.json` e `wrangler.jsonc`.
4. Vá em **Settings → Pages → Build and deployment** e selecione **GitHub Actions** em Source.
5. Em **Actions**, execute o workflow **Publicar jogo no GitHub Pages** se a publicação não iniciar após o primeiro push em `main`.
6. Confira o endereço que o próprio GitHub mostrará em **Settings → Pages**. Um formato comum é `https://SEU-USUARIO.github.io/rift-fighters/`, mas esse endereço é só um exemplo.

O workflow testa o combate e a V35, configura a hospedagem como estática, e publica o **conteúdo de `public/`** na raiz do site. A pasta `public/assets` deve ser mantida junto dos scripts e do `index.html`. Não faça upload apenas de `index.html`.

## Como jogar

- **A / D** ou ← / →: movimentação; **W / Espaço**: pular
- **Shift**: dash; **S**: defesa; **M1 / J**: combo; **K**: pesado
- **Z / X / C**: habilidades; **V**: especial; **Esc / P**: pausar
- **Celular:** botões na parte inferior da arena e botão adicional **PESADO**; vire o aparelho para paisagem
- **BOSSES:** enfrente os chefões em ordem; a vitória 2×0 ou 2×1 libera o próximo
- **LOJA:** gaste moedas em auras cosméticas, que **não** aumentam dano nem vida
- **PERFIL:** baixe seu save antes de trocar de navegador ou domínio

Vitória em duelo rende 180 moedas; derrota rende 60. A primeira vitória contra cada boss concede um bônus de campanha. Treinamento não concede moedas.

## Testar no computador

A V35 é uma aplicação estática. Inicie um servidor HTTP dentro de `public`, por exemplo:

```bash
cd public
python -m http.server 8000
```

Abra `http://localhost:8000`. Evite abrir o `index.html` por duplo clique, porque alguns navegadores restringem recursos locais. Para testar a suíte Node.js use uma versão moderna do Node (>= 22.13):

```bash
npm test
```

Os testes cobrem os sistemas originais da V34, Worker de salas e verificações estruturais da V35. Durante o desenvolvimento, uma sessão de navegador automatizada adicional confirmou inicialização sem erros, primeiro boss, vitória, desbloqueio do próximo, compra de aura, loja, perfil e comportamento responsivo de tela de toque. Isso não substitui testes manuais em celulares reais e em partidas completas.

## Salas online (opcional)

GitHub Pages **não executa APIs nem salas**. A parte `worker/`, `migrations/`, `wrangler.jsonc` e workflow Cloudflare foi preservada para implantação em sua própria conta Cloudflare, junto de um banco D1. Para implantar, configure credenciais na sua conta, crie o D1, configure o `database_id` real em `wrangler.jsonc`, aplique a migração e execute `npm run deploy`. **Nunca envie tokens para o repositório.**

## Arquivos principais

- `public/index.html`: site do jogo.
- `public/game.js`, `combat.js`, `trio.js`, `guests.js`: sistemas originais da V34.
- `public/v35.js`: bosses, IA, moedas, loja de auras, backup, melhorias de movimentação e toque.
- `public/v35.css`: menus, cartas, controle pesado e rolagem responsivos.
- `public/assets/`: imagens originais do ZIP.
- `.github/workflows/pages.yml`: publicação automática no GitHub Pages.
- `tests/v35.cjs`: verificações da nova versão.

## Observação sobre fonte

O arquivo de fonte binária do pacote original não foi redistribuído; a interface usa o fallback tipográfico monoespaçado do sistema. Todos os demais sprites, cenários e recursos relevantes foram mantidos.
