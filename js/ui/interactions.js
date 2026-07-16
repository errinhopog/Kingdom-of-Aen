// ============================================
// ===       DRAG AND DROP                 ===
// ============================================

/**
 * Inicia o arrastar de uma carta
 * @param {DragEvent} e - Evento de drag
 */
function dragStart(e) {
    if (playerPassed || isProcessingTurn) {
        e.preventDefault();
        return;
    }

    // Store card ID and Type in dataTransfer
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.dataTransfer.setData('card-type', e.target.dataset.type);

    // Visual feedback
    e.target.classList.add('dragging');
}

/**
 * Finaliza o arrastar de uma carta
 * @param {DragEvent} e - Evento de drag
 */
function dragEnd(e) {
    e.target.classList.remove('dragging');
}

/**
 * Configura os eventos de drag and drop nas fileiras
 */
function setupDragAndDrop() {
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
    if (playerPassed) return;
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

    if (playerPassed || isProcessingTurn) return;

    const cardId = e.dataTransfer.getData('text/plain');
    const cardType = e.dataTransfer.getData('card-type');
    const rowType = row.dataset.type;

    const card = document.querySelector(`.card[data-id="${cardId}"]`);
    if (!card) return;

    const isAgile = card.dataset.agile === 'true';

    if (cardType !== rowType && !isAgile) return;

    row.querySelector('.cards-container').appendChild(card);
    syncCardElementInstance(card, moveCardInstance(card.cardInstance, {
        zone: CARD_ZONES.BOARD,
        currentRow: rowType
    }));
    card.draggable = false;
    card.classList.remove('dragging');
    updateScore();

    try { audioManager.playSFX('card-place'); } catch (error) { console.warn('SFX failed', error); }
    if (!enemyPassed) queueEnemyTurn();
}
