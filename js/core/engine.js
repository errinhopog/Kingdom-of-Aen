// ============================================
// ===       ENGINE DO JOGO                ===
// ============================================

// ============================================
// ===       PONTUAÇÃO                     ===
// ============================================

/**
 * Atualiza a pontuação de todas as fileiras e retorna os totais
 * @returns {Object} { totalPlayer, totalOpponent }
 */
function updateScore() {
    let totalPlayer = 0;
    let totalOpponent = 0;

    const allRows = document.querySelectorAll('.row');

    allRows.forEach(row => {
        const rowType = row.dataset.type;
        const cards = Array.from(row.querySelectorAll('.card'));

        // 1. Check Weather
        let isWeathered = false;
        if (rowType === 'melee' && activeWeather.frost) isWeathered = true;
        if (rowType === 'ranged' && activeWeather.fog) isWeathered = true;
        if (rowType === 'siege' && activeWeather.rain) isWeathered = true;

        // 2. Check Tight Bonds - Count occurrences of each name
        const nameCounts = {};
        cards.forEach(card => {
            const name = card.dataset.name;
            nameCounts[name] = (nameCounts[name] || 0) + 1;
        });

        let rowScore = 0;

        cards.forEach(card => {
            let power = parseInt(card.dataset.basePower);
            const name = card.dataset.name;
            const ability = card.dataset.ability;
            const isHero = card.dataset.isHero === "true";

            // Apply Weather (Heroes are immune)
            if (isWeathered && !isHero) {
                power = 1;
            }

            // Apply Tight Bond
            if (!isHero && ability === 'tight_bond' && nameCounts[name] > 1) {
                power *= 2;
            }

            // Apply Bond Partner
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

    // Atualizar visuais dos líderes também
    updateLeaderVisuals();
}

/**
 * Loop de turnos do inimigo - continua jogando até passar
 */
function enemyTurnLoop() {
    if (enemyPassed) return;

    console.debug('[DEBUG enemyTurnLoop] starting loop iteration; enemyPassed=', enemyPassed);

    isProcessingTurn = true;
    updateTurnVisuals();

    scheduleGameTask(() => {
        enemyTurn();
        if (!enemyPassed) {
            console.debug('[DEBUG enemyTurnLoop] scheduling next iteration (enemy still active)');
            enemyTurnLoop();
        } else {
            console.debug('[DEBUG enemyTurnLoop] enemy passed — stopping loop');
            isProcessingTurn = false;
            updateTurnVisuals();
        }
    }, 1500);
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

        // PASSIVA DE FACÇÃO: ALFREDOLÂNDIA
        if (PLAYER_FACTION === 'alfredolandia') {
            console.log("[Passiva] Alfredolândia: Comprando 1 carta extra por vencer a rodada!");
            drawCard('player', 1);
            message += "\n🃏 Passiva de Facção: +1 carta!";
        }

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
            'weather-active-frost',
            'weather-active-fog',
            'weather-active-rain'
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

    updateLeaderVisuals();
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
    // 1. Clear Board (Visual & Logic)
    const allRows = document.querySelectorAll('.row .cards-container');
    allRows.forEach(container => {
        const cards = container.querySelectorAll('.card');
        cards.forEach(card => {
            const cardObj = {
                id: card.dataset.id,
                name: card.dataset.name,
                type: card.dataset.type,
                power: parseInt(card.dataset.basePower),
                ability: card.dataset.ability,
                isHero: card.dataset.isHero === "true"
            };

            if (container.closest('.opponent-side')) {
                enemyGraveyard.push(cardObj);
            } else {
                playerGraveyard.push(cardObj);
            }
        });
        container.innerHTML = '';
    });

    console.log("Cemitério Jogador:", playerGraveyard);
    console.log("Cemitério Inimigo:", enemyGraveyard);

    // 2. Reset States
    playerPassed = false;
    enemyPassed = false;
    isProcessingTurn = false;
    document.querySelector('.player-side').classList.remove('passed');
    document.querySelector('.opponent-side').classList.remove('passed');
    updateTurnVisuals();

    activeWeather = { frost: false, fog: false, rain: false };
    updateWeatherVisuals();

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
