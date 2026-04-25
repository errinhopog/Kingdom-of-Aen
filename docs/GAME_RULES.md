# Regras e Sistemas

Este documento descreve as regras implementadas hoje no codigo, nao necessariamente todas as regras planejadas para o jogo fisico.

## Objetivo

A partida e uma melhor de 3 rodadas. O primeiro lado a vencer 2 rodadas vence a partida.

## Deck

O deck do jogador e montado no deck builder.

Regras atuais:

- Minimo de 22 unidades.
- Maximo de 10 cartas especiais.
- Cada entrada em `CARD_COLLECTION` representa uma copia unica disponivel para o deck.
- O deck escolhido fica salvo no navegador via `localStorage`.

Colecao atual:

| Tipo | Quantidade |
| --- | ---: |
| Total de cartas | 43 |
| Unidades | 39 |
| Especiais | 4 |
| Melee | 20 |
| Ranged | 18 |
| Siege | 5 |
| Lideres | 4 |

## Sequencia da Partida

1. O jogador monta e valida o deck.
2. O jogo embaralha o deck do jogador.
3. O inimigo recebe um deck gerado automaticamente a partir das unidades da colecao.
4. Cada lado compra 10 cartas.
5. O jogador pode trocar ate 2 cartas no mulligan.
6. A batalha inicia com o turno do jogador.
7. O jogador joga uma carta ou passa.
8. A IA joga cartas ate decidir passar.
9. Quando ambos passam, a rodada termina.
10. O vencedor da rodada recebe uma gema de vitoria.

## Fileiras

As cartas sao jogadas em tres fileiras:

- `melee`: combate corpo a corpo.
- `ranged`: combate a distancia.
- `siege`: cerco.

Cartas com `row: "all"` sao tratadas como agile e podem ser jogadas em qualquer fileira valida.

## Pontuacao

A pontuacao de uma fileira e a soma do poder atual das cartas nela.

O poder pode ser alterado por:

- Clima.
- Vínculo forte.
- Vínculo por parceiro.
- Habilidade de lider que aumenta melee.

Herois sao imunes a clima e a efeitos de destruicao por scorch.

## Habilidades de Cartas

### Ativas na Colecao Atual

| Habilidade | Efeito |
| --- | --- |
| `bond_partner` | Dobra o poder se o parceiro estiver na mesma fileira. |
| `medic` | Revive a ultima carta nao heroi valida do cemiterio do mesmo lado. |
| `spy_medic` | Move a carta para o lado oposto, compra carta e tenta reviver carta. |
| `decoy` | Troca com uma unidade nao heroi do proprio lado e devolve essa unidade para a mao. |
| `hero` | Marca a carta como heroi e imune a alguns efeitos. |

### Implementadas, Mas Sem Cartas na Colecao Atual

| Habilidade | Efeito implementado |
| --- | --- |
| `tight_bond` | Dobra poder quando ha copias com o mesmo nome na fileira. |
| `spy` | Move carta para o lado oposto e compra carta. |
| `scorch` | Destrói as cartas mais fortes da fileira correspondente inimiga. |
| `weather_frost` | Reduz melee para 1, exceto herois. |
| `weather_fog` | Reduz ranged para 1, exceto herois. |
| `weather_rain` | Reduz siege para 1, exceto herois. |
| `weather_clear` | Remove todos os climas. |

## Lideres

O jogador usa `O General` por padrao. O inimigo recebe aleatoriamente um lider diferente.

| Lider | Habilidade | Efeito |
| --- | --- | --- |
| O General | `leader_clear_weather` | Remove todos os climas. |
| O Usurpador | `leader_scorch_siege` | Destroi a carta mais forte da fileira siege inimiga. |
| O Arquimago | `leader_draw_card` | Compra 1 carta. |
| O Senhor da Guerra | `leader_boost_melee` | Adiciona +2 ao poder base das unidades melee do proprio lado. |

## Passiva de Faccao

A faccao atual do jogador e `alfredolandia`.

Quando o jogador vence uma rodada, a passiva compra 1 carta extra.

## IA do Oponente

A IA escolhe uma carta por prioridade. Ela considera:

- Se deve usar o lider.
- Se deve passar por vantagem de pontos ou mao vazia.
- Se o jogador ja passou e o inimigo esta ganhando.
- Espioes no inicio do jogo ou quando esta perdendo.
- Medicos quando ha alvo bom no cemiterio.
- Parceiros ja na mesa ou na mao.
- Espantalho para reaproveitar cartas ou retirar cartas afetadas.
- Scorch quando pode atingir cartas fortes do jogador.
- Penalidade para jogar em fileiras afetadas por clima.

## Fim da Rodada

Quando ambos passam:

- O maior total de pontos vence.
- Empate concede uma vitoria para cada lado.
- Cartas no tabuleiro vao para o cemiterio correspondente.
- Clima e estados de passagem sao resetados.
- Cada lado compra 1 carta para a proxima rodada.
