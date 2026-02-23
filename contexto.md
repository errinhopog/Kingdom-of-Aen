# 📜 Kingdom of Aen - Contexto Completo do Projeto

> **Última atualização:** 23 de Fevereiro de 2026  
> **Autores:** Pedro Braga e Ramon  
> **Versão:** 2.1.0

---

## 🎮 O Que É Este Projeto?

**Kingdom of Aen (KoA)** é um jogo de cartas estratégico (TCG/CCG) inspirado no **Gwent** do universo The Witcher. O projeto é uma digitalização e evolução de um jogo de cartas físico originalmente criado e impresso manualmente.

O nome "Aen" é uma homenagem às iniciais de uma instituição (A.E.N.), recontextualizada como um antigo reino de fantasia medieval.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|------------|-----|
| **HTML5** | Estrutura das páginas (index.html) |
| **CSS3** | Estilização completa (style.css - 2468 linhas) |
| **JavaScript (Vanilla ES6+)** | Toda a lógica do jogo |
| **LocalStorage** | Persistência do deck do jogador e estado de áudio |
| **Audio API** | Música de fundo e efeitos sonoros |
| **Jest** | Framework de testes automatizados |

> ⚠️ **NÃO usa frameworks** como React, Vue ou Angular. É 100% vanilla JavaScript.

---

## 📁 Estrutura de Arquivos

```
Kingdom-of-Aen-main/
├── index.html                 # Página única com todas as cenas
├── README.md                  # Documentação básica do projeto
├── contexto.md               # (Este arquivo) Documentação completa
├── package.json              # Configuração npm e scripts de teste
├── .gitignore                # Configuração do Git
│
├── css/
│   └── style.css             # Todos os estilos (2468 linhas)
│                              # Inclui media queries para responsividade
│
├── js/
│   ├── main.js               # Inicialização do jogo (165 linhas)
│   ├── deckbuilder.js        # Sistema de construção de deck (395 linhas)
│   ├── app.js                # Ponto de entrada ES6 Module (NÃO carregado)
│   │                          # Bridge de compatibilidade ES6 ↔ globals
│   │
│   ├── core/                 # Núcleo do motor do jogo
│   │   ├── state.js          # Estado global (variáveis do jogo) - IIFE
│   │   ├── engine.js         # Motor de pontuação e turnos (438 linhas)
│   │   ├── ai.js             # Inteligência artificial do oponente (491 linhas)
│   │   ├── abilities.js      # Habilidades das cartas (309 linhas)
│   │   ├── leaders.js        # Sistema de líderes (269 linhas)
│   │   └── audio.js          # Gerenciador de áudio (classe AudioManager)
│   │
│   ├── ui/                   # Interface do usuário
│   │   ├── render.js         # Renderização de cartas/elementos (250 linhas)
│   │   ├── interactions.js   # Drag and drop (201 linhas)
│   │   └── mulligan.js       # Fase de troca de cartas inicial (239 linhas)
│   │
│   ├── data/
│   │   └── cards.js          # Base de dados de todas as cartas (~35 cartas)
│   │
│   ├── modules/              # Versões ES6 Module (preparação futura)
│   │   ├── cards.module.js   # Versão modular de cards.js
│   │   └── helpers.module.js # Versão modular de helpers.js
│   │
│   └── utils/
│       └── helpers.js        # Funções utilitárias e constantes (IIFE)
│
├── tests/                    # Testes automatizados (Jest)
│   ├── cards.test.js         # Testes do sistema de cartas (170 linhas)
│   └── engine.test.js        # Testes do motor do jogo (236 linhas)
│
├── audio/                    # Arquivos de áudio (16 arquivos)
│   ├── music_bg.mp3          # Música de fundo
│   ├── card-place-{1-4}.ogg  # Sons de jogar carta
│   ├── card-slide-{1-2}.ogg  # Sons de deslizar carta
│   ├── card-fan-{1-2}.ogg    # Sons de abrir cartas
│   ├── card-shuffle.ogg      # Som de embaralhar
│   ├── card-shove-1.ogg      # Som de empurrar carta
│   ├── dice-throw-3.ogg      # Som de dado
│   ├── die-throw-3.ogg       # Som de dado (variação)
│   ├── mouseclick1.ogg       # Som de clique
│   └── switch4.ogg           # Som de troca
│
└── img/
    ├── personagens/          # Imagens das cartas com arte (16 imagens)
    │   ├── Daniel.png, Gabriel.png, Wellington.png
    │   ├── Suelly.png, Adriano.png, Thiago.png
    │   ├── Geleia.png, Corredores.png, Cozinheiros.png
    │   ├── Espantalho.png, Ana Rita.png, Carol.png
    │   ├── Ciça.png, Marco.png, Paty.png
    │   └── Renata.png
    └── icons/                # Ícones das fileiras
        ├── icon-melee.png
        ├── icon-ranged.png
        └── icon-siege.png
```

---

## 🔌 Arquitetura de Carregamento

O `index.html` carrega os scripts via `<script>` tags (NÃO usa ES6 modules):

```
1. js/utils/helpers.js      ← Constantes e utilitários (IIFE → window.*)
2. js/data/cards.js          ← Dados das cartas (IIFE → window.*)
3. js/core/state.js          ← Estado global (IIFE → window.*)
4. js/core/audio.js          ← AudioManager (classe global)
5. js/core/abilities.js      ← Habilidades (funções globais)
6. js/core/leaders.js        ← Líderes (funções globais)
7. js/core/ai.js             ← IA (funções globais)
8. js/core/engine.js         ← Motor do jogo (funções globais)
9. js/ui/render.js           ← Renderização (funções globais)
10. js/ui/interactions.js    ← Drag & Drop (funções globais)
11. js/ui/mulligan.js        ← Mulligan (funções globais)
12. js/deckbuilder.js        ← Deck Builder (funções globais)
13. js/main.js               ← Inicialização (DOMContentLoaded)
```

> 📌 `js/app.js` existe mas **NÃO é carregado**. Serve como preparação futura para migração ES6 modules.

---

## 🎯 Fluxo do Jogo

### 1. **Cena 1: Deck Builder** (`#scene-builder`)
- Jogador monta seu deck selecionando cartas da coleção
- Regras: Mínimo 22 unidades, Máximo 10 especiais
- Deck é salvo no LocalStorage

### 2. **Transição: Mulligan** (Overlay)
- Jogador pode trocar até 2 cartas da mão inicial
- Cartas trocadas voltam ao deck

### 3. **Cena 2: Batalha** (`#scene-battle`)
- Tabuleiro com 3 fileiras por lado (Melee, Ranged, Siege)
- Sistema de turnos alternados
- Objetivo: Vencer 2 de 3 rodadas

### 4. **Modal: Game Over**
- Mostra resultado final (Vitória/Derrota/Empate)
- Opção de jogar novamente ou voltar ao Deck Builder

---

## 🃏 Sistema de Cartas

### Estrutura de uma Carta (cards.js)
```javascript
{
    id: 'daniel_1',           // ID único
    baseId: 'daniel',         // ID base (para múltiplas cópias)
    name: 'Daniel',           // Nome exibido
    type: 'melee',            // Tipo: melee | ranged | siege | weather
    power: 2,                 // Força base da carta
    img: 'img/personagens/Daniel.png',  // Imagem
    ability: 'bond_partner',  // Habilidade especial
    partner: 'Gabriel',       // Parceiro do vínculo
    category: 'unit',         // Categoria: unit | special
    isHero: false,            // Se é herói (imune a efeitos)
    row: 'all'                // (opcional) Se 'all', carta é ágil
}
```

### Tipos de Fileiras
| Tipo | Ícone | Clima que Afeta |
|------|-------|-----------------| 
| **Melee** | ⚔️ | Frost (Geada) |
| **Ranged** | 🏹 | Fog (Névoa) |
| **Siege** | 🏰 | Rain (Chuva) |

### Habilidades Disponíveis
| Habilidade | Descrição |
|------------|-----------|
| `bond_partner` | Dobra poder quando parceiro está na mesa |
| `tight_bond` | Dobra poder para cada cópia na mesma fileira |
| `spy` | Vai para o lado inimigo, jogador compra cartas |
| `spy_medic` | Espião + Médico combinados |
| `medic` | Revive uma carta do cemitério |
| `decoy` | Espantalho - troca lugar com carta no campo |
| `scorch` | Queima a carta mais forte da fileira inimiga |
| `hero` | Imune a todos os efeitos |

---

## 🤖 Inteligência Artificial (ai.js)

A IA segue um sistema de **prioridades** para decidir qual carta jogar:

1. **Prioridade 100+**: Espiões no início do jogo
2. **Prioridade 150**: Parceiros quando o outro já está na mesa
3. **Prioridade 85**: Usar Decoy em espiões do jogador
4. **Prioridade 70+**: Médico com boas cartas no cemitério
5. **Prioridade padrão**: Poder da carta

### Decisões de Passar
- Se a mão está vazia → Passa
- Se jogador passou E IA está ganhando → Passa
- Se vantagem ≥ 15 pontos E menos cartas que o jogador → Passa

---

## 👑 Sistema de Líderes (leaders.js)

Cada jogador tem um líder com habilidade única (uso único por partida):

| Líder | Habilidade |
|-------|------------|
| **O General** | Limpa todos os efeitos climáticos |
| **O Usurpador** | Destrói carta mais forte em Siege inimigo |
| **O Arquimago** | Compra 1 carta imediatamente |
| **O Senhor da Guerra** | +2 poder para todas unidades Melee |

---

## 🔊 Sistema de Áudio (audio.js)

Classe `AudioManager` gerencia:
- Música de fundo (loop)
- Efeitos sonoros (SFX) com variações aleatórias
- Toggle de mute (salvo no LocalStorage)

```javascript
// Uso
audioManager.playSFX('card-place');
audioManager.playMusic();
audioManager.toggleMute();
```

---

## 💾 Estado Global (state.js)

Variáveis globais que mantêm o estado do jogo (padrão IIFE com namespace `KoA`):

```javascript
// Clima
let activeWeather = { frost: false, fog: false, rain: false };

// Mãos e Decks
let enemyHand = [];
let playerDeck = [];
let enemyDeck = [];

// Turnos
let playerPassed = false;
let enemyPassed = false;
let isProcessingTurn = false;

// Vitórias (melhor de 3)
let playerWins = 0;
let enemyWins = 0;

// Cemitérios
let playerGraveyard = [];
let enemyGraveyard = [];

// Líderes
let playerLeader = null;
let enemyLeader = null;
let playerLeaderUsed = false;
let enemyLeaderUsed = false;

// Mulligan
let mulliganHand = [];
let mulliganRedraws = 2;
```

---

## 🔧 Checklist Completo de Funções (96 funções/métodos)

### Utils — `helpers.js`
| Função | Descrição |
|--------|-----------|
| `shuffleArray(array)` | Embaralha array (Fisher-Yates) |

### Dados — `cards.js`
| Função | Descrição |
|--------|-----------|
| `getCardById(id)` | Busca carta por ID |
| `getCardsByCategory(category)` | Filtra por categoria |
| `getCardsByType(type)` | Filtra por tipo |
| `countDeckComposition(deckIds)` | Conta unidades/especiais/poder |
| `validateDeck(deckIds)` | Valida regras do deck |
| `idsToCards(deckIds)` | Converte IDs para objetos |

### Estado — `state.js`
| Função | Descrição |
|--------|-----------|
| `resetGameState()` | Reseta todas as variáveis |
| `resetRoundState()` | Reseta apenas a rodada |
| `syncToGlobal()` | Sincroniza para `window.*` |

### Áudio — `audio.js` (classe `AudioManager`)
| Método | Descrição |
|--------|-----------|
| `constructor(basePath)` | Inicializa o gerenciador |
| `_loadMuteState()` | Carrega mute do LocalStorage |
| `_saveMuteState(muted)` | Salva mute |
| `_preloadAll()` | Pré-carrega todos os SFX |
| `playMusic(track)` | Inicia música de fundo |
| `stopMusic()` | Para a música |
| `playSFX(type)` | Toca efeito sonoro |
| `toggleMute()` | Alterna mute geral |

### Habilidades — `abilities.js`
| Função | Descrição |
|--------|-----------|
| `triggerAbility(cardElement, rowElement)` | Dispara habilidade |
| `applyWeather(type)` | Aplica efeito climático |
| `clearWeather()` | Limpa todos os climas |
| `updateWeatherVisuals()` | Atualiza visuais de clima |
| `applyMedic(cardElement, currentRow)` | Revive carta |
| `applySpy(cardElement, currentRow)` | Move para lado oposto |
| `drawCard(who, count)` | Compra cartas do deck |
| `applyScorch(cardElement, currentRow)` | Destrói cartas mais fortes |

### Líderes — `leaders.js`
| Função | Descrição |
|--------|-----------|
| `initializeLeaders()` | Inicializa líderes |
| `renderLeaderCards()` | Renderiza na UI |
| `getLeaderAbilityDescription(ability)` | Retorna descrição |
| `setupLeaders()` | Configura eventos de clique |
| `activateLeader(who)` | Ativa habilidade |
| `executeLeaderAbility(ability, who)` | Executa habilidade |
| `updateLeaderVisuals()` | Atualiza visuais |
| `shouldEnemyUseLeader()` | IA decide uso do líder |

### IA — `ai.js`
| Função | Descrição |
|--------|-----------|
| `getPlayerHandCount()` | Conta cartas do jogador |
| `isPartnerOnBoard(partnerName)` | Verifica parceiro no tabuleiro |
| `isPartnerInHand(partnerName)` | Verifica parceiro na mão |
| `findPlayerSpiesOnEnemySide()` | Encontra espiões do jogador |
| `findDecoyTargets()` | Encontra alvos para Decoy |
| `findStrongestPlayerCard()` | Carta mais forte do jogador |
| `findStrongestEnemyCard()` | Carta mais forte do inimigo |
| `getTotalCardsOnBoard()` | Total de cartas no tabuleiro |
| `getBestRowForAgile()` | Melhor fileira para ágil |
| `enemyTurn()` | Função principal da IA |

### Motor — `engine.js`
| Função | Descrição |
|--------|-----------|
| `updateScore()` | Recalcula pontuação |
| `passTurn(who)` | Passa turno |
| `updateTurnVisuals()` | Atualiza visuais de turno |
| `enemyTurnLoop()` | Loop de turnos do inimigo |
| `checkEndRound()` | Verifica fim de rodada |
| `endRound(winner)` | Finaliza rodada |
| `showRoundMessage(message)` | Mostra mensagem |
| `showGameOverModal()` | Modal de fim de jogo |
| `resetGame()` | Reseta jogo completo |
| `updateGems(who, count)` | Atualiza gemas |
| `prepareNextRound()` | Prepara próxima rodada |

### Renderização — `render.js`
| Função | Descrição |
|--------|-----------|
| `renderHand()` | Renderiza mão (usa allCardsData) |
| `renderHandFromCards(cards)` | Renderiza mão de array |
| `updateEnemyHandUI()` | Atualiza contador inimigo |
| `updateDeckCountUI()` | Atualiza contador do deck |
| `createCardElement(card)` | Cria elemento DOM de carta |

### Interações — `interactions.js`
| Função | Descrição |
|--------|-----------|
| `dragStart(e)` | Inicia drag |
| `dragEnd(e)` | Finaliza drag |
| `setupDragAndDrop()` | Configura drag nas fileiras |
| `dragOver(e)` | Arrastar sobre fileira |
| `dragLeave(e)` | Sair da fileira |
| `drop(e)` | Soltar carta na fileira |

### Mulligan — `mulligan.js`
| Função | Descrição |
|--------|-----------|
| `startMulligan(playerHand)` | Inicia fase de mulligan |
| `renderMulliganCards()` | Renderiza cartas |
| `createMulliganCardElement(card, index)` | Cria carta no mulligan |
| `redrawCard(index)` | Troca carta |
| `finishMulligan()` | Finaliza e inicia jogo |

### Deck Builder — `deckbuilder.js`
| Função | Descrição |
|--------|-----------|
| `initDeckBuilder()` | Inicializa builder |
| `renderCollection()` | Renderiza coleção filtrável |
| `createBuilderCard(card)` | Cria carta no builder |
| `renderDeck()` | Renderiza deck |
| `createDeckCard(card)` | Cria carta no painel do deck |
| `addCardToDeck(cardId)` | Adiciona carta |
| `removeCardFromDeck(cardId)` | Remove carta |
| `clearDeck()` | Limpa deck |
| `updateStats()` | Atualiza estatísticas |
| `saveDeckToStorage()` | Salva no LocalStorage |
| `loadDeckFromStorage()` | Carrega do LocalStorage |
| `setupBuilderEvents()` | Configura eventos |
| `startBattle()` | Inicia batalha |
| `backToBuilder()` | Volta ao builder |
| `createDefaultDeck()` | Cria deck padrão |

### Inicialização — `main.js`
| Função | Descrição |
|--------|-----------|
| `initializeGame()` | Inicializa sem deck builder |
| `initializeGameWithDeck(deckIds)` | Inicializa com deck |
| `setupControls()` | Configura controles |

---

## 📊 Histórico de Melhorias

### ✅ Versão 2.1.0 (14/01/2026 - Atual)
1. **Melhorias de Design (HD+)**:
   - Suporte a monitores largos (>1600px) com layout limitado a 90%
   - Aumento de tamanho de cartas, ícones e fontes em alta resolução
   - Prevenção de achatamento (`flex-shrink: 0`) nas cartas
2. **Refatoração Modular**:
   - Migração para padrão IIFE com namespace `KoA`
   - Melhora na organização do código e compatibilidade `file://`
3. **app.js**:
   - Criado como bridge ES6 → global (não carregado pelo index.html)

### ✅ Versão 1.1.0 (14/01/2026)
1. ~~**Espaçamento de cartas quebrado**~~ → Corrigido CSS de `.cards-container`
2. ~~**Duplicação de código**~~ → `shuffleArray` removida de `cards.js`
3. ~~**Funções deprecated**~~ → `applyDecoy`, `applyTightBond` removidas
4. ~~**Imagens quebradas**~~ → Placeholder CSS para cartas sem imagem
5. ~~**Responsividade mobile**~~ → Media queries para tablets/celulares
6. ~~**Testes automatizados**~~ → Jest + testes para cards e engine
7. ~~**Preparação ES6 Modules**~~ → Arquivos `.module.js` criados

### ✅ Versão 1.0.0 (Inicial)
- Implementação base do jogo
- Deck Builder funcional
- Sistema de batalha completo
- IA básica

---

## 📱 Responsividade

O CSS agora inclui media queries para:

| Breakpoint | Dispositivo | Mudanças |
|------------|-------------|----------|
| `≥1600px` | Monitores Largos | Layout 90%, fontes/ícones maiores |
| `≤1024px` | Tablets | Cartas menores, layout compacto |
| `≤768px` | Mobile | Layout vertical, líderes ocultos |
| `≤480px` | Mobile pequeno | Cartas muito compactas |
| Paisagem | Mobile rotacionado | Altura reduzida |

---

## 🧪 Testes Automatizados

### Executar Testes
```bash
# Instalar dependências (primeira vez)
npm install

# Rodar todos os testes
npm test

# Rodar testes em modo watch
npm run test:watch
```

### Cobertura de Testes
- `tests/cards.test.js` - Sistema de cartas, validação de deck, shuffleArray
- `tests/engine.test.js` - Motor do jogo, clima, pontuação, cálculo de poder

---

## 🚀 Como Rodar o Projeto

### Produção (simples)
Abra `index.html` diretamente no navegador

### Desenvolvimento
```bash
# Servidor local (recomendado)
npm run dev

# Ou com Python
python -m http.server 8000

# Ou com extensão Live Server do VS Code
```

---

## 📝 Convenções de Código

- **Nomenclatura**: camelCase para funções e variáveis
- **Comentários**: JSDoc para funções públicas
- **Organização**: Arquivos separados por responsabilidade
- **Constantes**: UPPER_SNAKE_CASE (ex: `CARD_COLLECTION`)
- **Padrão**: IIFE com namespace `KoA` para encapsulamento
- **Módulos**: Arquivos `.module.js` para versões ES6 (preparação futura)

---

## 🖼️ Imagens Faltando

As seguintes imagens são referenciadas em `cards.js` com caminho `assets/` mas **a pasta não existe**:

**Líderes:**
- `assets/leader_general.png`
- `assets/leader_usurper.png`
- `assets/leader_archmage.png`
- `assets/leader_warlord.png`

**Personagens (referenciados como `assets/*`):**
- `anderson.png`, `vanessa.png`, `pattenberg.png`
- `marcelo.png`, `clarice.png`, `jacy.png`
- `kariel.png`, `jassyhara.png`
- `eliel.png`, `ritatril.png`, `marcus.png`

> 📌 **Nota:** Cartas sem imagem exibem um placeholder visual (padrão xadrez).
> As 16 imagens existentes estão em `img/personagens/`.

---

## 📌 Notas para Desenvolvimento Futuro

1. Os arquivos em `js/modules/` estão prontos para migração ES6
2. `app.js` já importa e expõe módulos — falta migrar os outros arquivos
3. A constante `PLAYER_FACTION` está hardcoded como 'alfredolandia'
4. O inimigo sempre usa cartas da `CARD_COLLECTION`
5. Considerar PWA com Service Worker para offline
6. Multiplayer via WebSocket seria interessante
7. Criar pasta `assets/` e migrar/criar todas as imagens faltantes
8. Atualizar `package.json` version para `2.1.0`

---

*Este documento serve como referência completa para entender, manter e expandir o projeto Kingdom of Aen.*
