# Kingdom of Aen

Kingdom of Aen e um jogo de cartas tatico de navegador, inspirado em Gwent (The Witcher 3). O jogador monta um deck no Deck Builder e disputa partidas em melhor de 3 rodadas, jogando cartas em fileiras de melee, ranged e siege, com habilidades, lideres e clima.

O projeto e uma aplicacao web estatica feita com HTML, CSS e JavaScript puro, sem etapa de build, bundler ou framework no estado atual.

## Estado Atual (snapshot)

- Single-player (Jogador vs IA local) totalmente jogavel.
- Deck builder com filtros, estatisticas e persistencia em `localStorage`.
- Colecao com 43 cartas (39 unidades + 4 especiais) e 4 lideres com habilidades distintas.
- Tabuleiro com fileiras `melee`, `ranged` e `siege`, alem de cartas agile (`row: "all"`).
- Sistema de mulligan (ate 2 trocas iniciais), melhor de 3 rodadas, gemas de vitoria, modal de fim de jogo.
- IA do oponente baseada em prioridades: passa, usa lider, joga combos, medicos, espioes, espantalhos e cartas climaticas.
- Audio de fundo e efeitos sonoros locais com mute persistido.
- Validador automatico de dados e assets em `scripts/validate-project.js`.

> **Importante:** o modo **online (multiplayer real)** ainda **nao existe** no codigo. Hoje so e possivel jogar localmente contra a IA. Veja [docs/ROADMAP.md](docs/ROADMAP.md) e [docs/MULTIPLAYER.md](docs/MULTIPLAYER.md) para o plano de evolucao.

## Como Rodar

Opcao simples (abrir o HTML direto):

```powershell
Start-Process .\index.html
```

Opcao recomendada (servidor local, evita problemas de file://):

```powershell
python -m http.server 8080
```

Depois acesse:

```text
http://localhost:8080
```

## Como Jogar

1. Monte um deck no Deck Builder.
2. O deck precisa ter pelo menos 22 unidades e no maximo 10 especiais.
3. Inicie a batalha. O sistema embaralha o deck e compra 10 cartas para cada lado.
4. No mulligan, troque ate 2 cartas iniciais.
5. Jogue cartas nas fileiras corretas (melee, ranged, siege ou agile) ou passe a rodada.
6. Vence a rodada quem tiver a maior pontuacao total no tabuleiro.
7. Vence a partida quem ganhar 2 rodadas (melhor de 3).

## Estrutura

```text
.
|-- index.html          # Cenas: Deck Builder + Tabuleiro
|-- css/
|   `-- style.css       # Layout, cartas, animacoes, modais
|-- js/
|   |-- core/           # Estado, audio, habilidades, lideres, IA, engine
|   |-- data/           # Cartas e lideres (CARD_COLLECTION, leaderCardsData)
|   |-- ui/             # Render, drag-and-drop, mulligan
|   |-- utils/          # Helpers globais
|   |-- deckbuilder.js  # Deck Builder + persistencia
|   `-- main.js         # Inicializacao
|-- img/
|   |-- icons/          # Icones de fileira
|   `-- personagens/    # Artes de cartas
|-- audio/              # Musica e SFX
|-- scripts/
|   `-- validate-project.js
`-- docs/
```

## Documentacao

Documentacao tecnica e de produto em `docs/`:

- **Visao do Produto**
  - [Escopo](docs/SCOPE.md) - o que e e o que nao e o jogo, MVP, fora de escopo
  - [Roadmap / Destino Final](docs/ROADMAP.md) - visao 1.0, marcos e ordem de prioridades
  - [Plano Multiplayer Online](docs/MULTIPLAYER.md) - arquitetura proposta para PvP online
- **Engenharia**
  - [Arquitetura](docs/ARCHITECTURE.md) - modulos, ordem de scripts, contratos de dados
  - [Regras e Sistemas](docs/GAME_RULES.md) - regras implementadas hoje no motor
  - [Guia de Desenvolvimento](docs/DEVELOPMENT.md) - como adicionar carta, habilidade, debug
  - [Assets](docs/ASSETS.md) - imagens, audios, lacunas
  - [Melhorias Recomendadas](docs/IMPROVEMENTS.md) - debito tecnico priorizado
  - [Plano de Sprints](docs/SPRINTS.md) - sprints curtos derivados das melhorias

## Observacoes Importantes

- Algumas cartas e todos os lideres apontam para `assets/*.png`, mas essa pasta nao existe. O jogo continua funcionando com o visual de fallback (sem arte real). Lista completa em [Assets](docs/ASSETS.md).
- Algumas habilidades ja estao implementadas no motor (`weather_*`, `scorch`, `spy`, `tight_bond`), mas ainda nao existem cartas usando-as na colecao atual. Detalhes em [Regras e Sistemas](docs/GAME_RULES.md).
- O modo online ainda e um plano. Hoje so existe single-player vs IA. Veja [docs/MULTIPLAYER.md](docs/MULTIPLAYER.md).

## Autoria

Desenvolvido por Pedro Braga e Ramon.
