/** Estado canônico da sessão atual. */
let gameState = createGameState();

/** Timers vinculados à sessão de jogo atual. */
const pendingGameTimers = new Set();

/**
 * Aplica um comando puro e atualiza a projeção visual quando disponível.
 * @param {Object} command
 * @param {{render?: boolean}} options
 */
function dispatchGameCommand(command, { render = true } = {}) {
    gameState = gameReducer(gameState, command);
    if (render && typeof renderGameState === 'function') renderGameState(gameState);
    return gameState;
}

/** Agenda uma tarefa que será cancelada ao descartar a sessão. */
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

/** Reseta todo o estado e cancela tarefas da sessão anterior. */
function resetGameState() {
    cancelPendingGameTasks();
    gameState = createGameState();
}

/** Reseta o tabuleiro e os passes, mantendo decks, mãos e vitórias. */
function resetRoundState() {
    dispatchGameCommand({ type: 'RESET_ROUND' });
}
