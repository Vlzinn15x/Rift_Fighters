# Rift Fighters — projeto para GitHub

Versão 33: 11 lutadores, 33 habilidades, especiais, treino, upgrades e salas PC/celular.
Este pacote contém o jogo e os recursos, com um servidor de salas independente da hospedagem anterior.

## Comece aqui

1. Extraia este ZIP. Não envie o ZIP fechado como único arquivo do repositório.
2. Crie um repositório chamado `rift-fighters` na sua conta do GitHub.
3. Envie o **conteúdo desta pasta**, incluindo `.github`, `public`, `worker`, `migrations`, `tests`, `README.md`, `package.json` e `wrangler.jsonc`.
4. No repositório, abra **Settings → Pages → Build and deployment → Source → GitHub Actions**.
5. Abra **Actions → Publicar jogo no GitHub Pages → Run workflow**. Espere terminar.
6. O link aparece em **Settings → Pages** e no resultado da publicação. Normalmente tem o formato `https://SEU-USUARIO.github.io/rift-fighters/` — esse é um exemplo, não um endereço já criado.

### Envio mais fácil pelo computador

Use o GitHub Desktop para criar um repositório local a partir desta pasta e use **Publish repository** para enviar à sua conta. Confira que a pasta `.github` entrou no envio. Não publique `node_modules`, `.env`, `.dev.vars` ou `.wrangler`.

Se preferir terminal, dentro desta pasta:

```sh
git init -b main
git add .
git commit -m "Rift Fighters v33"
git remote add origin URL_DO_REPOSITORIO_QUE_VOCE_CRIOU
git push -u origin main
```

## Qual publicação escolher?

| Publicação | Solo e treino | Salas online | Atualiza após push em main |
| --- | --- | --- | --- |
| GitHub Pages | Sim | Não: Pages só hospeda arquivos | Sim, após ativar Pages |
| Cloudflare Worker + D1 | Sim | Sim | Sim, após configurar abaixo |

No GitHub Pages, a tela de salas avisa a limitação e os botões online ficam desativados. Os personagens, mapas, M1, poderes, especiais e upgrades locais continuam disponíveis. Não abra `index.html` por duplo clique: use o site publicado ou um servidor local.

## Publicar o jogo completo, com salas online

Requer uma conta Cloudflare. As credenciais são configuradas na sua conta; nenhuma foi incluída neste pacote. Verifique os limites e a cobrança da sua conta antes de publicar.

1. Instale Node.js 22.13 ou superior.
2. No terminal desta pasta:

```sh
npm install
npx wrangler login
npm run db:create
```

3. Copie o `database_id` retornado e substitua o ID de exemplo em `wrangler.jsonc`. Salve esse arquivo no repositório.
4. Prepare o banco e publique:

```sh
npm run db:remote
npm run deploy
```

O comando de publicação informa o endereço real do seu jogo completo. O banco começa vazio: salas antigas não são transferidas. Perfis e upgrades continuam locais ao navegador e ao domínio; trocar de domínio não transfere esse progresso automaticamente.

### Atualização automática pelo GitHub

Em **Settings → Secrets and variables → Actions**, configure:

- Secret `CLOUDFLARE_API_TOKEN`: token com permissão para editar Workers e D1 na sua conta.
- Secret `CLOUDFLARE_ACCOUNT_ID`: ID da conta Cloudflare.
- Variable `DEPLOY_TO_CLOUDFLARE`: valor `true`.

Nunca cole tokens no código ou no README. Após configurar, o workflow **Publicar jogo completo na Cloudflare** publica os próximos pushes de `main`. O workflow de Pages também pode permanecer ativo; ele publica uma cópia solo separada. Se quiser apenas Cloudflare, desative o workflow de Pages na aba Actions.

## Como atualizar o jogo depois

Edite os arquivos em `public/`, teste e envie um novo commit para `main`. As publicações configuradas são executadas novamente; o endereço permanece o mesmo. Você também pode enviar a pasta ou o repositório para continuar trabalhando no jogo em outra conversa.

- `public/game.js`: regras, personagens e entrada.
- `public/combat.js`: combos e especiais.
- `public/trio.js` / `trio-animated.js`: Lula, Bolsonaro e Ichigo.
- `public/menu-screen.css` / `menu-screen.js`: interfaces sem rolagem.
- `public/assets/`: sprites, cenários e efeitos.
- `worker/index.ts`: API das salas.
- `tests/guest-combat.cjs`: testes do combate e regressões.

### Testar localmente

```sh
npm install
npm run db:local
npm run dev
```

Abra o endereço indicado no terminal. Para testar o combate sem iniciar servidor:

```sh
npm test
```

Documentação de referência:
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- https://developers.cloudflare.com/workers/static-assets/routing/worker-script/
