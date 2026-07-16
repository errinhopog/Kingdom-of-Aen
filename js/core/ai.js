/** Retorna a quantidade de cartas na mão do jogador. */
function getPlayerHandCount() {
    return document.querySelectorAll('.hand-cards .card').length;
}

/** Verifica se um parceiro já está no tabuleiro do oponente. */
function isPartnerOnBoard(partnerName) {
    return Boolean(document.querySelector(`.row.opponent .card[data-name="${partnerName}"]`));
}

/** Verifica se um parceiro ainda está na mão da IA. */
function isPartnerInHand(partnerName) {
    return enemyHand.some(card => card.name === partnerName);
}

/** Calcula uma prioridade simples e determinística para uma unidade. */
function getCardPriority(card) {
    if (card.ability === 'bond_partner' && card.partner) {
        if (isPartnerOnBoard(card.partner)) return 100 + card.power;
        if (isPartnerInHand(card.partner)) return 20 + card.power;
    }
    return card.power + (card.isHero ? 5 : 0);
}

/** Decide se a IA deve economizar cartas e encerrar a rodada. */
function shouldEnemyPass(scores) {
    if (enemyHand.length === 0) return true;
    if (playerPassed && scores.totalOpponent > scores.totalPlayer) return true;

    const lead = scores.totalOpponent - scores.totalPlayer;
    return lead >= 12 && enemyHand.length < getPlayerHandCount();
}

/** Escolhe o índice da melhor carta disponível. */
function chooseEnemyCardIndex() {
    let bestIndex = -1;
    let bestPriority = -Infinity;

    enemyHand.forEach((card, index) => {
        const priority = getCardPriority(card);
        if (priority > bestPriority) {
            bestPriority = priority;
            bestIndex = index;
        }
    });

    return bestIndex;
}

/** Executa exatamente uma ação da IA. */
function enemyTurn() {
    if (enemyPassed) return;

    const scores = updateScore();
    if (shouldEnemyPass(scores)) {
        passTurn('opponent');
        return;
    }

    const cardIndex = chooseEnemyCardIndex();
    if (cardIndex < 0) {
        passTurn('opponent');
        return;
    }

    const [handCard] = enemyHand.splice(cardIndex, 1);
    const card = moveCardInstance(handCard, {
        zone: CARD_ZONES.BOARD,
        currentRow: handCard.type
    });
    const target = document.querySelector(`.row.opponent[data-type="${card.type}"] .cards-container`);
    if (!target) {
        enemyHand.push(handCard);
        passTurn('opponent');
        return;
    }

    const cardElement = createCardElement(card);
    cardElement.draggable = false;
    target.appendChild(cardElement);
    updateEnemyHandUI();
    updateScore();

    try { audioManager.playSFX('card-place'); } catch (error) { console.warn('SFX failed', error); }
}
