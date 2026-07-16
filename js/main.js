// ============================================
// ===       INICIALIZAÇÃO DO JOGO         ===
// ============================================

/**
 * Inicializa o jogo com o sistema antigo (sem deck builder)
 */
function initializeGame() {
    const defaultIds = CARD_COLLECTION.slice(0, 22).map(card => card.id);
    initializeGameWithDeck(defaultIds);
}

/**
 * Inicializa o jogo com um deck do Deck Builder
 * @param {Array} deckIds - Array de IDs das cartas do deck
 */
function initializeGameWithDeck(deckIds) {
    console.log("=== INICIANDO JOGO COM DECK ===");
    console.log("Deck IDs:", deckIds);

    const playerCards = shuffleArray(idsToCards(deckIds, GAME_SIDES.PLAYER));
    const enemyDeckIds = CARD_COLLECTION.map(card => card.id);
    const opponentCards = shuffleArray(idsToCards(enemyDeckIds, GAME_SIDES.OPPONENT));

    dispatchGameCommand({
        type: 'INITIALIZE_GAME',
        playerDeck: playerCards,
        opponentDeck: opponentCards
    });

    console.log("Deck embaralhado (player):", playerCards.length, "cartas");
    console.log("Deck inimigo (built):", opponentCards.length, "cartas");
    startMulligan();

    console.log("=== AGUARDANDO MULLIGAN ===");
}

// ============================================
// ===       CONTROLES                     ===
// ============================================

/**
 * Configura os controles do jogo (botão passar, etc.)
 */
function setupControls() {
    const passBtn = document.getElementById('pass-button');
    if (passBtn) {
        passBtn.addEventListener('click', () => {
            if (gameState.players.player.passed || gameState.processing) return;

            dispatchGameCommand({ type: 'PASS_SIDE', side: GAME_SIDES.PLAYER });
            console.log("Jogador passou a vez.");

            // Play button SFX
            try { audioManager.playSFX('switch'); } catch (e) { console.warn('SFX failed', e); }

            // If player passes, enemy plays until they win or pass
            if (!gameState.players.opponent.passed) {
                enemyTurnLoop();
            } else {
                checkEndRound();
            }
        });
    }
}

// ============================================
// ===       INICIALIZAÇÃO                 ===
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // NÃO inicializar automaticamente - esperar pelo Deck Builder
    setupDragAndDrop();
    setupControls();

    // Start music on first user interaction (browser gesture requirement)
    document.addEventListener('click', () => {
        try { audioManager.playMusic(); } catch (e) { console.warn('Audio start failed', e); }
    }, { once: true });

    // Create mute/unmute toggle button
    try {
        const btn = document.createElement('button');
        btn.id = 'audio-toggle-btn';
        btn.title = 'Mute / Unmute Audio';
        btn.className = 'audio-toggle';
        const setLabel = (muted) => btn.textContent = muted ? '🔇' : '🔊';
        setLabel(audioManager.sfxMuted || audioManager.musicMuted);
        btn.addEventListener('click', (e) => {
            const newMuted = audioManager.toggleMute();
            setLabel(newMuted);
        });
        btn.style.position = 'fixed';
        btn.style.right = '12px';
        btn.style.top = '12px';
        btn.style.zIndex = 9999;
        btn.style.background = 'rgba(0,0,0,0.6)';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.padding = '8px 10px';
        btn.style.borderRadius = '6px';
        btn.style.cursor = 'pointer';
        document.body.appendChild(btn);
    } catch (e) { console.warn('Failed to create audio toggle', e); }
});
