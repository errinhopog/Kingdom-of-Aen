// ============================================
// ===       ENGINE DO JOGO                ===
// ============================================

// ============================================
// ===       PONTUAÇÃO                     ===
// ============================================

/**
 * Compra cartas do deck.
 * @param {'player'|'opponent'} who
 * @param {number} count
 */
function drawCard(who, count) {
    for (let i = 0; i < count; i++) {
        if (who === 'player') {
            if (playerDeck.length === 0) continue;
            const drawnCard = playerDeck.shift();
            const newCard = { ...drawnCard, id: `p_draw_${Date.now()}_${i}_${drawnCard.id}` };
            document.querySelector('.hand-cards')?.appendChild(createCardElement(newCard));
            updateDeckCountUI();
        } else {
            if (enemyDeck.length === 0) continue;
            const drawnCard = enemyDeck.shift();
            enemyHand.push({ ...drawnCard, id: `e_draw_${Date.now()}_${i}_${drawnCard.id}` });
            updateEnemyHandUI();
        }
    }
}

/**
 * Atualiza a pontuação de todas as fileiras e retorna os totais
 * @returns {Object} { totalPlayer, totalOpponent }
 */
function updateScore() {
    let totalPlayer = 0;
    let totalOpponent = 0;

    const allRows = document.querySelectorAll('.row');

    allRows.forEach(row => {
        const cards = Array.from(row.querySelectorAll('.card'));

        // Conta os nomes para resolver vínculos entre parceiros.
        const nameCounts = {};
        cards.forEach(card => {
            const name = card.dataset.name;
            nameCounts[name] = (nameCounts[name] || 0) + 1;
        });

        let rowScore = 0;

        cards.forEach(card => {
            let power = parseInt(card.dataset.basePower);
            const ability = card.dataset.ability;
            const isHero = card.dataset.isHero === "true";

            // Aplica vínculo entre parceiros.
            const partner = card.dataset.partner;
            if (!isHero && ability === 'bond_partner' && partner) {
                if (nameCounts[partner] && nameCounts[partner] > 0) {
                    power *= 2;
                }
            }

            // Update Visuals
            let badge = card.querySelector('.card-strength-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.classList.add('card-strength-badge');
                card.appendChild(badge);
            }
            badge.textContent = power;
            if (power > parseInt(card.dataset.basePower)) {
                badge.classList.add('buffed');
                badge.classList.remove('nerfed');
            } else if (power < parseInt(card.dataset.basePower)) {
                badge.classList.add('nerfed');
                badge.classList.remove('buffed');
            } else {
                badge.classList.remove('buffed', 'nerfed');
            }

            // Update dataset for other logic
            card.dataset.power = power;

            rowScore += power;
        });

        row.querySelector('.row-score').textContent = rowScore;

        if (row.classList.contains('player')) {
            totalPlayer += rowScore;
        } else {
            totalOpponent += rowScore;
        }
    });

    // Update Totals
    document.getElementById('score-total-player').textContent = totalPlayer;
    document.getElementById('score-total-opponent').textContent = totalOpponent;

    return { totalPlayer, totalOpponent };
}

// ============================================
// ===       CONTROLE DE TURNOS            ===
// ============================================

const ENEMY_TURN_DELAY_MS = 1500;
const ENEMY_EFFECT_SETTLE_MS = 850;

/**
 * Passa o turno para um jogador
 * @param {string} who - 'player' ou 'opponent'
 */
function passTurn(who) {
    if (who === 'opponent') {
        enemyPassed = true;
        document.querySelector('.opponent-side').classList.add('passed');
        updateTurnVisuals();
        checkEndRound();
    }
}

/**
 * Atualiza os visuais de turno ativo
 */
function updateTurnVisuals() {
    const playerSide = document.querySelector('.player-side');
    const opponentSide = document.querySelector('.opponent-side');

    if (!playerSide || !opponentSide) return;

    playerSide.classList.remove('active-turn');
    opponentSide.classList.remove('active-turn');

    if (isProcessingTurn && !enemyPassed) {
        opponentSide.classList.add('active-turn');
    } else if (!playerPassed) {
        playerSide.classList.add('active-turn');
    }

}

/** Finaliza a ação da IA e devolve o controle ao jogador. */
function finishEnemyAction() {
    isProcessingTurn = false;
    updateTurnVisuals();
}

/**
 * Agenda uma jogada da IA. No modo contínuo, a IA segue jogando até passar.
 * @param {boolean} continuous
 */
function scheduleEnemyAction(continuous) {
    scheduleGameTask(() => {
        enemyTurn();

        if (continuous && !enemyPassed) {
            scheduleEnemyAction(true);
            return;
        }

        scheduleGameTask(finishEnemyAction, ENEMY_EFFECT_SETTLE_MS);
    }, ENEMY_TURN_DELAY_MS);
}

/**
 * Solicita uma ação da IA e bloqueia novas entradas até a conclusão.
 * @param {{continuous?: boolean}} options
 */
function queueEnemyTurn({ continuous = false } = {}) {
    if (enemyPassed || isProcessingTurn) return;

    isProcessingTurn = true;
    updateTurnVisuals();
    scheduleEnemyAction(continuous);
}

/** Loop da IA usado depois que o jogador passa a rodada. */
function enemyTurnLoop() {
    queueEnemyTurn({ continuous: true });
}

// ============================================
// ===       FIM DE RODADA                 ===
// ============================================

/**
 * Verifica se a rodada terminou (ambos passaram)
 */
function checkEndRound() {
    if (playerPassed && enemyPassed) {
        const scores = updateScore();
        scheduleGameTask(() => {
            let winner = "";
            if (scores.totalPlayer > scores.totalOpponent) {
                winner = "player";
            } else if (scores.totalOpponent > scores.totalPlayer) {
                winner = "opponent";
            } else {
                winner = "draw";
            }
            endRound(winner);
        }, 500);
    }
}

/**
 * Finaliza a rodada e atribui pontos
 * @param {string} winner - 'player', 'opponent' ou 'draw'
 */
function endRound(winner) {
    let message = "";
    if (winner === "player") {
        playerWins++;
        message = "Você venceu a rodada!";
        updateGems("player", playerWins);

    } else if (winner === "opponent") {
        enemyWins++;
        message = "Oponente venceu a rodada!";
        updateGems("opponent", enemyWins);
    } else {
        // Draw: Both get a point
        playerWins++;
        enemyWins++;
        message = "Empate! Ambos pontuam.";
        updateGems("player", playerWins);
        updateGems("opponent", enemyWins);
    }

    // Verificar se a partida acabou
    if (playerWins >= 2 || enemyWins >= 2) {
        showGameOverModal();
    } else {
        showRoundMessage(message);
    }
}

/**
 * Mostra mensagem de fim de rodada
 * @param {string} message - Mensagem a mostrar
 */
function showRoundMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'round-toast';
    toast.innerHTML = `<span>${message.replace(/\n/g, '<br>')}</span>`;
    document.body.appendChild(toast);

    scheduleGameTask(() => {
        toast.classList.add('show');
    }, 100);

    scheduleGameTask(() => {
        toast.classList.remove('show');
        scheduleGameTask(() => {
            toast.remove();
            prepareNextRound();
        }, 300);
    }, 2500);
}

// ============================================
// ===       FIM DE JOGO                   ===
// ============================================

/**
 * Mostra o modal de fim de jogo
 */
function showGameOverModal() {
    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');
    const icon = document.getElementById('modal-icon');
    const playerScore = document.getElementById('final-player-wins');
    const enemyScore = document.getElementById('final-enemy-wins');

    // Atualizar placar
    playerScore.textContent = playerWins;
    enemyScore.textContent = enemyWins;

    // Determinar resultado
    if (playerWins >= 2 && enemyWins >= 2) {
        title.textContent = "EMPATE!";
        title.className = "modal-title draw";
        subtitle.textContent = "Uma batalha digna de lendas!";
        icon.textContent = "⚖️";
    } else if (playerWins >= 2) {
        title.textContent = "VITÓRIA!";
        title.className = "modal-title victory";
        subtitle.textContent = "Você dominou o campo de batalha!";
        icon.textContent = "👑";
        try { audioManager.playSFX('switch'); } catch (e) { console.warn('SFX failed', e); }
    } else {
        title.textContent = "DERROTA";
        title.className = "modal-title defeat";
        subtitle.textContent = "O inimigo prevaleceu desta vez...";
        icon.textContent = "💀";
        try { audioManager.playSFX('switch'); } catch (e) { console.warn('SFX failed', e); }
    }

    // Mostrar modal
    modal.classList.remove('hidden');

    // Setup botão de jogar novamente
    const playAgainBtn = document.getElementById('play-again-btn');
    playAgainBtn.onclick = () => {
        try { audioManager.playSFX('mouseclick'); } catch (e) { }
        modal.classList.add('hidden');
        resetGame();
    };
}

/**
 * Reseta o jogo completamente
 */
function resetGame() {
    console.log("=== REINICIANDO JOGO ===");
    disposeGameSession();

    if (typeof playerDeckIds !== 'undefined' && playerDeckIds.length > 0) {
        initializeGameWithDeck(playerDeckIds);
    } else {
        initializeGame();
    }

    console.log("=== JOGO REINICIADO ===");
}

/**
 * Descarta a sessão atual sem alterar o deck salvo no builder.
 * @param {{stopAudio?: boolean}} options
 */
function disposeGameSession({ stopAudio = false } = {}) {
    resetGameState();

    document.querySelectorAll('.row .cards-container, .hand-cards, #mulligan-cards')
        .forEach(container => { container.innerHTML = ''; });

    document.querySelectorAll('.gem').forEach(gem => gem.classList.remove('active'));
    document.querySelectorAll('.row, .player-side, .opponent-side')
        .forEach(element => element.classList.remove(
            'passed',
            'active-turn',
            'drag-over',
            'valid-target'
        ));

    document.querySelectorAll('.round-toast').forEach(toast => toast.remove());
    document.getElementById('mulligan-overlay')?.classList.add('hidden');
    document.getElementById('game-over-modal')?.classList.add('hidden');

    const passBtn = document.getElementById('pass-button');
    if (passBtn) {
        passBtn.disabled = false;
        passBtn.textContent = 'Passar Rodada';
    }

    const counters = {
        'score-total-player': '0',
        'score-total-opponent': '0',
        'enemy-hand-count': '0',
        'player-deck-count': '0'
    };
    Object.entries(counters).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    if (stopAudio) audioManager.stopMusic();
}

/**
 * Atualiza as gemas de vitória
 * @param {string} who - 'player' ou 'opponent'
 * @param {number} count - Quantidade de vitórias
 */
function updateGems(who, count) {
    const containerId = who === "player" ? "player-gems" : "opponent-gems";
    const container = document.getElementById(containerId);
    const gems = container.querySelectorAll('.gem');

    for (let i = 0; i < count; i++) {
        if (gems[i]) gems[i].classList.add('active');
    }
}

/**
 * Prepara a próxima rodada
 */
function prepareNextRound() {
    // 1. Remove as unidades da rodada encerrada.
    const allRows = document.querySelectorAll('.row .cards-container');
    allRows.forEach(container => { container.innerHTML = ''; });

    // 2. Reset States
    playerPassed = false;
    enemyPassed = false;
    isProcessingTurn = false;
    document.querySelector('.player-side').classList.remove('passed');
    document.querySelector('.opponent-side').classList.remove('passed');
    updateTurnVisuals();

    // 3. Reset UI Controls
    const passBtn = document.getElementById('pass-button');
    passBtn.disabled = false;
    passBtn.textContent = "Passar Rodada";

    // 4. Draw 1 Card for Player
    drawCard('player', 1);

    // 5. Draw 1 Card for Enemy
    drawCard('opponent', 1);

    // 6. Update Scores (to 0)
    updateScore();

    alert("Nova Rodada Iniciada! +1 Carta para cada.");
}
