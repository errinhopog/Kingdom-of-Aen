# Arquitetura

Kingdom of Aen roda como uma pagina estatica. Um `GameState` imutavel e a unica fonte de verdade da partida; a interface e reconstruida a partir dele.

## Visao Geral

```mermaid
flowchart TD
    A["Deck Builder"] --> B["Validacao do Deck"]
    B --> C["Inicializacao da Partida"]
    C --> D["Mulligan"]
    D --> E["Batalha"]
    E --> F["Fim da Rodada"]
    F --> G{"Alguem tem 2 vitorias?"}
    G -- "Nao" --> H["Preparar Proxima Rodada"]
    H --> E
    G -- "Sim" --> I["Modal de Fim de Jogo"]
    I --> A
```

## Ordem dos Scripts

`index.html` carrega os arquivos nesta ordem:

1. `js/utils/helpers.js`
2. `js/domain/card.js`
3. `js/domain/game-state.js`
4. `js/data/cards.js`
5. `js/core/state.js`
6. `js/core/audio.js`
7. `js/core/ai.js`
8. `js/core/engine.js`
9. `js/ui/render.js`
10. `js/ui/interactions.js`
11. `js/ui/mulligan.js`
12. `js/deckbuilder.js`
13. `js/main.js`

Essa ordem e parte do contrato atual do projeto. Como os arquivos nao usam ES Modules, funcoes e constantes precisam existir globalmente antes de serem chamadas.

## Modulos

| Arquivo | Responsabilidade |
| --- | --- |
| `index.html` | Estrutura das duas cenas: deck builder e batalha. |
| `css/style.css` | Layout, cartas, tabuleiro, modais, animacoes, mulligan e deck builder. |
| `js/data/cards.js` | Dados de cartas, validacao de deck e helpers de colecao. |
| `js/domain/card.js` | Definicoes e instancias canonicas, zonas, ownership e controle. |
| `js/domain/game-state.js` | Estado puro, reducer, comandos e calculo de pontuacao. |
| `js/utils/helpers.js` | Constantes de icones e descricoes de habilidades. |
| `js/core/state.js` | Store da sessao, dispatch e registro de timers cancelaveis. |
| `js/core/audio.js` | Musica, efeitos sonoros, cache de audio e mute persistido. |
| `js/core/ai.js` | Decisao do oponente por prioridades. |
| `js/core/engine.js` | Orquestracao de turnos, fim de rodada, fim de jogo e reset. |
| `js/ui/render.js` | Projecao integral de `GameState` para o DOM. |
| `js/ui/interactions.js` | Drag and drop das cartas do jogador. |
| `js/ui/mulligan.js` | Fase de troca inicial de cartas. |
| `js/deckbuilder.js` | Montagem, filtros, estatisticas e persistencia do deck. |
| `js/main.js` | Inicializacao do jogo, controles principais e botao de audio. |

## Estado da Partida

`js/domain/game-state.js` define o estado puro e `js/core/state.js` mantem apenas a referencia da sessao atual. `GameState` contem:

- `phase` e `processing`: fase atual e bloqueio de entrada.
- `mulliganRedraws`: trocas restantes.
- `players.player` e `players.opponent`: deck, mao, tabuleiro, passe e vitorias de cada lado.

Toda mudanca passa por `gameReducer()`. Os comandos cobrem inicializacao, mulligan, inicio da batalha, compra, jogada, passe, premiacao e reset de rodada. `calculateGameScore()` recebe somente o estado e roda em Node sem DOM.

`renderGameState()` limpa e recria mao, tabuleiro, placar, contadores, gemas e estados de turno. O DOM nunca e consultado para decidir uma regra.

`pendingGameTimers`, mantido fora do dominio, registra tarefas assincronas pertencentes a sessao atual.

O deck escolhido pelo jogador fica em `playerDeckIds`, definido em `js/deckbuilder.js`, e e salvo em `localStorage` com a chave `kingdomOfAen_playerDeck`.

## Fluxo de Inicializacao

1. `DOMContentLoaded` em `deckbuilder.js` chama `initDeckBuilder()`.
2. O deck salvo e carregado do `localStorage`.
3. A colecao e o deck sao renderizados.
4. `DOMContentLoaded` em `main.js` configura drag and drop, controles e audio.
5. Ao clicar em iniciar batalha, `startBattle()` valida o deck e chama `initializeGameWithDeck(playerDeckIds)`.
6. O jogador e o inimigo compram 10 cartas.
7. O mulligan inicia antes da batalha ficar jogavel.

## Contratos de Dados

`CardDefinition` e a fonte imutavel de nome, poder, arte e habilidade. `CardInstance` referencia essa definicao e adiciona estado de runtime:

- `instanceId`: identidade unica e estavel durante toda a sessao.
- `definitionId` e `definition`: ligacao com a definicao original.
- `ownerId`: dono permanente da carta.
- `controllerId`: lado que controla a carta no momento.
- `zone`: `deck`, `mulligan`, `hand` ou `board`.
- `currentRow`: fileira ocupada quando a zona e `board`.

Transicoes retornam uma nova instancia imutavel, preservando identidade, definicao e ownership. O elemento visual mantem uma referencia direta em `cardInstance`; seus `data-*` sao apenas metadados de apresentacao durante a migracao do estado.

Cada carta da colecao deve seguir este formato base:

```js
{
  id: "daniel_1",
  baseId: "daniel",
  name: "Daniel",
  type: "melee",
  power: 2,
  img: "img/personagens/Daniel.png",
  ability: "bond_partner",
  partner: "Gabriel",
  category: "unit"
}
```

Campos relevantes:

- `id`: identificador unico da copia.
- `baseId`: identificador da carta base.
- `type`: fileira principal: `melee`, `ranged` ou `siege`.
- `row: "all"`: carta agile, pode ir em qualquer fileira.
- `category`: `unit`, usado pela validacao do deck.
- `ability`: `bond_partner` ou `hero` no recorte atual.
- `partner`: nome da unidade necessaria para ativar `bond_partner`.
- `isHero`: identifica unidades heroicas.

## Contratos de Execucao

- Uma sessao nova sempre cancela timers pertencentes a sessao anterior.
- A IA conclui toda a sua acao antes de liberar a entrada do jogador.
- Cartas sem arte cadastrada usam o fallback visual e nao apontam para arquivos inexistentes.
- Toda habilidade presente nos dados precisa ter regra alcancavel, descricao e cobertura de teste.
