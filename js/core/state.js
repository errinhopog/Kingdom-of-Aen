/**
 * @fileoverview Estado global do jogo Kingdom of Aen
 * @module core/state
 * @author Kingdom of Aen Team
 */

// ============================================
// ===       ESTADO DAS MÃOS               ===
// ============================================

/**
 * Cartas na mão do inimigo
 * @type {Array<Object>}
 */
let enemyHand = [];

/**
 * Deck do jogador (cartas restantes)
 * @type {Array<Object>}
 */
let playerDeck = [];

/**
 * Deck do inimigo (cartas restantes)
 * @type {Array<Object>}
 */
let enemyDeck = [];

// ============================================
// ===       ESTADO DOS TURNOS             ===
// ============================================

/**
 * Se o jogador passou a vez
 * @type {boolean}
 */
let playerPassed = false;

/**
 * Se o inimigo passou a vez
 * @type {boolean}
 */
let enemyPassed = false;

/**
 * Se está processando um turno (aguardando animações/IA)
 * @type {boolean}
 */
let isProcessingTurn = false;

/** Timers vinculados à sessão de jogo atual. */
const pendingGameTimers = new Set();

/**
 * Agenda uma tarefa que será cancelada ao descartar a sessão.
 * @param {Function} callback
 * @param {number} delay
 * @returns {number}
 */
function scheduleGameTask(callback, delay) {
    const timerId = setTimeout(() => {
        pendingGameTimers.delete(timerId);
        callback();
    }, delay);
    pendingGameTimers.add(timerId);
    return timerId;
}

/** Cancela todas as tarefas pendentes da sessão atual. */
function cancelPendingGameTasks() {
    pendingGameTimers.forEach(timerId => clearTimeout(timerId));
    pendingGameTimers.clear();
}

// ============================================
// ===       ESTADO DAS VITÓRIAS           ===
// ============================================

/**
 * Número de rodadas vencidas pelo jogador
 * @type {number}
 */
let playerWins = 0;

/**
 * Número de rodadas vencidas pelo inimigo
 * @type {number}
 */
let enemyWins = 0;

// ============================================
// ===       CEMITÉRIOS                    ===
// ============================================

/**
 * Cartas no cemitério do jogador
 * @type {Array<Object>}
 */
let playerGraveyard = [];

/**
 * Cartas no cemitério do inimigo
 * @type {Array<Object>}
 */
let enemyGraveyard = [];

// ============================================
// ===       MULLIGAN                      ===
// ============================================

/**
 * Mão temporária durante a fase de mulligan
 * @type {Array<Object>}
 */
let mulliganHand = [];

/**
 * Trocas restantes durante o mulligan
 * @type {number}
 */
let mulliganRedraws = 2;

// ============================================
// ===       FUNÇÕES DE RESET              ===
// ============================================

/**
 * Reseta todo o estado do jogo para valores iniciais
 * @returns {void}
 */
function resetGameState() {
    cancelPendingGameTasks();
    enemyHand = [];
    playerDeck = [];
    enemyDeck = [];
    playerPassed = false;
    enemyPassed = false;
    isProcessingTurn = false;
    playerWins = 0;
    enemyWins = 0;
    playerGraveyard = [];
    enemyGraveyard = [];
    mulliganHand = [];
    mulliganRedraws = 2;
}

/**
 * Reseta apenas o estado da rodada (mantém vitórias e cemitérios)
 * @returns {void}
 */
function resetRoundState() {
    playerPassed = false;
    enemyPassed = false;
    isProcessingTurn = false;
}

// ============================================
// ===       EXPORTS (Futuros ES6 Modules) ===
// ============================================
// Quando migrar para ES6 Modules, exportar o estado como objeto
// export { enemyHand, playerDeck, enemyDeck, ... };
