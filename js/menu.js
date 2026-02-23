/**
 * @fileoverview Menu Principal e Sistema de Decks Pré-Montados
 * @module menu
 * @author Kingdom of Aen Team
 * 
 * Gerencia navegação entre cenas, decks pré-montados e o power cap
 */

window.KoA = window.KoA || {};

(function (KoA) {
    'use strict';

    // ============================================
    // ===       CONSTANTES DE BALANCEAMENTO   ===
    // ============================================

    const POWER_CAP = 100;

    // ============================================
    // ===       DECKS PRÉ-MONTADOS            ===
    // ============================================

    const PRESET_DECKS = {
        combo_master: {
            name: 'Combo Master',
            icon: '🗡️',
            description: 'Maximiza pares com Bond Partner. Daniel+Gabriel e Marcelo+Suelly dominam o campo.',
            strategy: 'Sinergias de Combo',
            cards: [
                'daniel_1', 'daniel_2', 'daniel_3',
                'gabriel_1', 'gabriel_2', 'gabriel_3',
                'marcelo_1', 'marcelo_2', 'marcelo_3',
                'suelly_1', 'suelly_2', 'suelly_3',
                'anderson_1', 'anderson_2',
                'cozinheiros_1', 'cozinheiros_2',
                'vanessa_1', 'vanessa_2',
                'wellington_1',
                'pattenberg_1',
                'ritatril_1',
                'jacy_1',
                'espantalho_1'
            ]
        },
        fortaleza: {
            name: 'Fortaleza',
            icon: '🏰',
            description: 'Pura força bruta com as cartas mais poderosas. Sir Marcus lidera o exército.',
            strategy: 'Poder Máximo',
            cards: [
                'wellington_1', 'wellington_2',
                'pattenberg_1', 'pattenberg_2',
                'eliel_1',
                'marcus_1',
                'adr14no_1', 'adr14no_2',
                'marcelo_1', 'marcelo_2',
                'clarice_1', 'clarice_2',
                'anderson_1', 'anderson_2',
                'jassyhara_1', 'jassyhara_2',
                'vanessa_1', 'vanessa_2',
                'ritatril_1',
                'jacy_1',
                'thiago_1',
                'kariel_1'
            ]
        },
        blitz: {
            name: 'Blitz Strike',
            icon: '⚡',
            description: 'Volume massivo de cartas. Nunca fique sem opções na mão.',
            strategy: 'Controle de Mão',
            cards: [
                'daniel_1', 'daniel_2', 'daniel_3',
                'gabriel_1', 'gabriel_2', 'gabriel_3',
                'thiago_1', 'thiago_2',
                'kariel_1', 'kariel_2',
                'jacy_1', 'jacy_2',
                'vanessa_1', 'vanessa_2',
                'cozinheiros_1', 'cozinheiros_2',
                'clarice_1', 'clarice_2',
                'anderson_1', 'anderson_2',
                'ritatril_1', 'ritatril_2',
                'eliel_1',
                'adr14no_1'
            ]
        },
        espionagem: {
            name: 'Espionagem',
            icon: '🎭',
            description: 'Espiões e médicos para vantagem de cartas. Use decoys para reusar espiões.',
            strategy: 'Card Advantage',
            cards: [
                'geleia_1',
                'corredores_1',
                'ritatril_1', 'ritatril_2',
                'espantalho_1', 'espantalho_2',
                'daniel_1', 'daniel_2', 'daniel_3',
                'gabriel_1', 'gabriel_2', 'gabriel_3',
                'suelly_1', 'suelly_2', 'suelly_3',
                'thiago_1', 'thiago_2',
                'kariel_1', 'kariel_2',
                'jacy_1', 'jacy_2',
                'vanessa_1', 'vanessa_2',
                'anderson_1',
                'clarice_1',
                'cozinheiros_1'
            ]
        }
    };

    // ============================================
    // ===       NAVEGAÇÃO ENTRE CENAS         ===
    // ============================================

    function showScene(sceneId) {
        // Esconder todas as cenas
        document.querySelectorAll('.scene').forEach(scene => {
            scene.classList.remove('active');
        });

        // Mostrar a cena desejada
        const targetScene = document.getElementById(sceneId);
        if (targetScene) {
            targetScene.classList.add('active');
        }

        console.log(`[Menu] Navegou para: ${sceneId}`);
    }

    function goToMenu() {
        showScene('scene-menu');
    }

    function goToPlay() {
        renderDeckSelect();
        showScene('scene-deck-select');
    }

    function goToBuilder() {
        showScene('scene-builder');
        // Re-inicializar o builder se necessário
        if (typeof initDeckBuilder === 'function') {
            initDeckBuilder();
        }
    }

    function goToSettings() {
        // Por enquanto, mostra um toast simples
        showMenuToast('⚙️ Configurações em breve!');
    }

    function showAbout() {
        const aboutOverlay = document.getElementById('about-overlay');
        if (aboutOverlay) {
            aboutOverlay.classList.remove('hidden');
        }
    }

    function hideAbout() {
        const aboutOverlay = document.getElementById('about-overlay');
        if (aboutOverlay) {
            aboutOverlay.classList.add('hidden');
        }
    }

    function showMenuToast(message) {
        const toast = document.getElementById('menu-toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
    }

    // ============================================
    // ===       SELEÇÃO DE DECK               ===
    // ============================================

    function renderDeckSelect() {
        const grid = document.getElementById('deck-select-grid');
        if (!grid) return;

        grid.innerHTML = '';

        // Renderizar cada deck pré-montado
        Object.entries(PRESET_DECKS).forEach(([key, deck]) => {
            const stats = calculateDeckStats(deck.cards);
            const card = document.createElement('div');
            card.className = 'preset-deck-card';
            card.innerHTML = `
                <div class="preset-deck-icon">${deck.icon}</div>
                <h3 class="preset-deck-name">${deck.name}</h3>
                <p class="preset-deck-strategy">${deck.strategy}</p>
                <p class="preset-deck-description">${deck.description}</p>
                <div class="preset-deck-stats">
                    <div class="preset-stat">
                        <span class="preset-stat-value">${stats.totalPower}</span>
                        <span class="preset-stat-label">Poder</span>
                    </div>
                    <div class="preset-stat">
                        <span class="preset-stat-value">${stats.total}</span>
                        <span class="preset-stat-label">Cartas</span>
                    </div>
                    <div class="preset-stat">
                        <span class="preset-stat-value">${stats.units}</span>
                        <span class="preset-stat-label">Unidades</span>
                    </div>
                </div>
            `;
            card.addEventListener('click', () => selectPresetDeck(key));
            grid.appendChild(card);
        });

        // Botão "Criar Próprio"
        const customCard = document.createElement('div');
        customCard.className = 'preset-deck-card preset-deck-custom';
        customCard.innerHTML = `
            <div class="preset-deck-icon">🔧</div>
            <h3 class="preset-deck-name">Criar Meu Deck</h3>
            <p class="preset-deck-strategy">Modo Livre</p>
            <p class="preset-deck-description">Monte seu próprio deck no Deck Builder com limite de ${POWER_CAP} de poder.</p>
            <div class="preset-deck-stats">
                <div class="preset-stat">
                    <span class="preset-stat-value">${POWER_CAP}</span>
                    <span class="preset-stat-label">Max Poder</span>
                </div>
            </div>
        `;
        customCard.addEventListener('click', () => goToBuilder());
        grid.appendChild(customCard);
    }

    function calculateDeckStats(cardIds) {
        let units = 0;
        let specials = 0;
        let totalPower = 0;

        cardIds.forEach(id => {
            const card = KoA.getCardById ? KoA.getCardById(id) : (typeof getCardById === 'function' ? getCardById(id) : null);
            if (card) {
                if (card.category === 'special') {
                    specials++;
                } else {
                    units++;
                }
                totalPower += card.power || 0;
            }
        });

        return { units, specials, total: units + specials, totalPower };
    }

    function selectPresetDeck(deckKey) {
        const deck = PRESET_DECKS[deckKey];
        if (!deck) return;

        console.log(`[Menu] Deck selecionado: ${deck.name}`);

        // Salvar o deck selecionado no localStorage (mesmo formato que o builder usa)
        localStorage.setItem('kingdomOfAen_playerDeck', JSON.stringify(deck.cards));

        // Ir direto para a batalha (show battle scene + init game)
        showScene('scene-battle');

        // Inicializar o jogo com o deck selecionado
        if (typeof initializeGameWithDeck === 'function') {
            initializeGameWithDeck(deck.cards);
        } else if (typeof window.initializeGameWithDeck === 'function') {
            window.initializeGameWithDeck(deck.cards);
        }
    }

    // ============================================
    // ===       INICIALIZAÇÃO DO MENU         ===
    // ============================================

    function initMenu() {
        // Botões do menu principal
        const btnPlay = document.getElementById('menu-btn-play');
        const btnSettings = document.getElementById('menu-btn-settings');
        const btnAbout = document.getElementById('menu-btn-about');

        if (btnPlay) btnPlay.addEventListener('click', goToPlay);
        if (btnSettings) btnSettings.addEventListener('click', goToSettings);
        if (btnAbout) btnAbout.addEventListener('click', showAbout);

        // Botão voltar no deck select
        const btnBackToMenu = document.getElementById('btn-back-to-menu');
        if (btnBackToMenu) btnBackToMenu.addEventListener('click', goToMenu);

        // Botão fechar About
        const btnCloseAbout = document.getElementById('btn-close-about');
        if (btnCloseAbout) btnCloseAbout.addEventListener('click', hideAbout);

        // Botão voltar ao menu no deck builder
        const btnBuilderBack = document.getElementById('btn-builder-to-menu');
        if (btnBuilderBack) btnBuilderBack.addEventListener('click', goToMenu);

        console.log('[Menu] Inicializado com sucesso');
    }

    // ============================================
    // ===       EXPORTS                       ===
    // ============================================

    KoA.POWER_CAP = POWER_CAP;
    KoA.PRESET_DECKS = PRESET_DECKS;
    KoA.showScene = showScene;
    KoA.goToMenu = goToMenu;
    KoA.goToPlay = goToPlay;
    KoA.goToBuilder = goToBuilder;
    KoA.initMenu = initMenu;
    KoA.selectPresetDeck = selectPresetDeck;

    window.POWER_CAP = POWER_CAP;
    window.PRESET_DECKS = PRESET_DECKS;
    window.showScene = showScene;
    window.goToMenu = goToMenu;
    window.goToPlay = goToPlay;
    window.goToBuilder = goToBuilder;
    window.initMenu = initMenu;
    window.selectPresetDeck = selectPresetDeck;

})(window.KoA);
