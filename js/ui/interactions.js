import { GAME_SIDES } from '../domain/game-state.js';
import { audioManager } from '../core/audio.js';
import { queueEnemyTurn } from '../core/engine.js';
import { dispatchGameCommand, gameState } from '../core/state.js';

// ============================================
// ===       DRAG AND DROP                 ===
// ============================================

/**
 * Inicia o arrastar de uma carta
 * @param {DragEvent} e - Evento de drag
 */
export function dragStart(e) {
    if (gameState.players.player.passed || gameState.processing) {
        e.preventDefault();
        return;
    }

    // Store card ID and Type in dataTransfer
    e.dataTransfer.setData('text/plain', e.target.dataset.id);

    // Visual feedback
    e.target.classList.add('dragging');
}

/**
 * Finaliza o arrastar de uma carta
 * @param {DragEvent} e - Evento de drag
 */
export function dragEnd(e) {
    e.target.classList.remove('dragging');
}

/**
 * Configura os eventos de drag and drop nas fileiras
 */
export function setupDragAndDrop() {
    const playerRows = document.querySelectorAll('.row.player');

    playerRows.forEach(row => {
        row.addEventListener('dragover', dragOver);
        row.addEventListener('dragleave', dragLeave);
        row.addEventListener('drop', drop);
    });
}

/**
 * Evento de arrastar sobre uma fileira
 * @param {DragEvent} e - Evento de drag
 */
function dragOver(e) {
    e.preventDefault();
    if (gameState.players.player.passed || gameState.processing) return;
    const row = e.currentTarget;
    row.classList.add('drag-over');
}

/**
 * Evento de sair de uma fileira arrastando
 * @param {DragEvent} e - Evento de drag
 */
function dragLeave(e) {
    const row = e.currentTarget;
    row.classList.remove('drag-over');
}

/**
 * Evento de soltar uma carta em uma fileira
 * @param {DragEvent} e - Evento de drop
 */
function drop(e) {
    e.preventDefault();
    const row = e.currentTarget;
    row.classList.remove('drag-over');

    if (gameState.players.player.passed || gameState.processing) return;

    const cardId = e.dataTransfer.getData('text/plain');
    const rowType = row.dataset.type;

    try {
        dispatchGameCommand({
            type: 'PLAY_CARD',
            side: GAME_SIDES.PLAYER,
            instanceId: cardId,
            row: rowType
        });
    } catch (error) {
        console.warn('Jogada inválida', error.message);
        return;
    }

    try { audioManager.playSFX('card-place'); } catch (error) { console.warn('SFX failed', error); }
    if (!gameState.players.opponent.passed) queueEnemyTurn();
}
