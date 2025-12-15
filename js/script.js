// cardDatabase is now loaded from cards.js as allCardsData

// Game State
let activeWeather = { frost: false, fog: false, rain: false };
let enemyHand = [];
let playerPassed = false;
let enemyPassed = false;
let isProcessingTurn = false;
let playerWins = 0;
let enemyWins = 0;
let playerGraveyard = [];
let enemyGraveyard = [];

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    setupDragAndDrop();
    setupControls();
});

function initializeGame() {
    renderHand();
    // Initialize Enemy Hand with random cards from DB (simulating a deck)
    enemyHand = []; // Reset to ensure clean start
    for (let i = 0; i < 10; i++) { 
        const randomCard = allCardsData[Math.floor(Math.random() * allCardsData.length)];
        // Clone object to avoid reference issues if we modify it later
        enemyHand.push({ ...randomCard, id: `e${i}_${randomCard.id}` });
    }
    
    updateScore();
    updateEnemyHandUI();
    updateTurnVisuals();
}

function updateEnemyHandUI() {
    const el = document.getElementById('enemy-hand-count');
    if (el) {
        el.textContent = enemyHand.length;
    }
}

function setupControls() {
    const passBtn = document.getElementById('pass-button');
    if (passBtn) {
        passBtn.addEventListener('click', () => {
            if (playerPassed || isProcessingTurn) return;
            
            playerPassed = true;
            passBtn.disabled = true;
            passBtn.textContent = "Passado";
            console.log("Jogador passou a vez.");
            
            // Visual update
            document.querySelector('.player-side').classList.add('passed');
            updateTurnVisuals();

            // If player passes, enemy plays until they win or pass
            if (!enemyPassed) {
                enemyTurnLoop();
            } else {
                checkEndRound();
            }
        });
    }
}

function renderHand() {
    const handContainer = document.querySelector('.hand-cards');
    if (!handContainer) return;

    handContainer.innerHTML = ''; // Clear existing content

    allCardsData.forEach(card => {
        const cardElement = createCardElement(card);
        handContainer.appendChild(cardElement);
    });
}

function createCardElement(card) {
    const el = document.createElement('div');
    el.classList.add('card');
    el.draggable = true; // Enable native drag
    el.dataset.id = card.id;
    el.dataset.type = card.type;
    el.dataset.kind = card.kind || "unit"; // Default to unit
    el.dataset.power = card.power; // Current power
    el.dataset.basePower = card.power; // Original power for resets/calculations
    el.dataset.name = card.name;
    el.dataset.ability = card.ability || "none";
    el.dataset.isHero = card.isHero || "false";
    if (card.partner) el.dataset.partner = card.partner;
    if (card.row) el.dataset.row = card.row;

    if (card.isHero) {
        el.classList.add('hero-card');
    }

    // Power Badge
    const power = document.createElement('div');
    power.classList.add('card-power');
    power.textContent = card.power;
    el.appendChild(power);

    // Image Placeholder
    const img = document.createElement('div');
    img.classList.add('card-img');
    // img.style.backgroundImage = `url(${card.img})`; 
    el.appendChild(img);

    // Name
    const name = document.createElement('div');
    name.classList.add('card-name');
    name.textContent = card.name;
    el.appendChild(name);

    // Ability Icon (Optional visual indicator)
    if (card.ability && card.ability !== "none") {
        const abilityIcon = document.createElement('div');
        abilityIcon.classList.add('card-ability-icon');
        if (card.ability === 'spy' || card.ability === 'spy_medic') {
            abilityIcon.textContent = "👁️"; // Eye for Spy
        } else if (card.ability === 'scorch') {
            abilityIcon.textContent = "🔥"; // Fire for Scorch
        } else if (card.ability === 'medic') {
            abilityIcon.textContent = "⚕️"; // Medical symbol
        } else if (card.ability === 'bond_partner') {
            abilityIcon.textContent = "🤝"; // Handshake for Bond
        } else if (card.ability === 'decoy') {
            abilityIcon.textContent = "🔄"; // Arrows for Decoy
        } else {
            abilityIcon.textContent = "★"; // Star for others
        }
        el.appendChild(abilityIcon);
    }

    // Drag Events
    el.addEventListener('dragstart', dragStart);
    el.addEventListener('dragend', dragEnd);

    // Drop Events for Decoy Interaction (Only if it's on the board)
    // We add these to ALL cards, but logic inside will filter
    el.addEventListener('dragover', function(e) {
        const draggingCard = document.querySelector('.dragging');
        if (!draggingCard) return;

        const isDecoy = draggingCard.dataset.ability === 'decoy';
        if (!isDecoy) return;

        const targetCard = e.currentTarget;
        
        // Validate Target:
        // 1. Must be on Player Side (we can check parent row class)
        const row = targetCard.closest('.row');
        if (!row || !row.classList.contains('player')) return;

        // 2. Must NOT be Hero
        if (targetCard.dataset.isHero === "true") return;

        // 3. Must NOT be another Decoy
        if (targetCard.dataset.ability === 'decoy') return;

        // Valid Target!
        e.preventDefault(); // Allow drop
        e.stopPropagation(); // Stop bubbling to row
        targetCard.classList.add('valid-target');
    });

    el.addEventListener('dragleave', function(e) {
        e.currentTarget.classList.remove('valid-target');
    });

    el.addEventListener('drop', function(e) {
        const targetCard = e.currentTarget;
        targetCard.classList.remove('valid-target');

        const draggingCard = document.querySelector('.dragging');
        if (!draggingCard) return;

        const isDecoy = draggingCard.dataset.ability === 'decoy';
        if (!isDecoy) return;

        // Validate Target again (security)
        const row = targetCard.closest('.row');
        if (!row || !row.classList.contains('player')) return;
        if (targetCard.dataset.isHero === "true") return;
        if (targetCard.dataset.ability === 'decoy') return;

        e.preventDefault();
        e.stopPropagation(); // CRITICAL: Stop row drop handler

        console.log(`Decoy (Manual) ativado! Trocando com: ${targetCard.dataset.name}`);

        // 1. Return Target to Hand
        const returnedCardObj = {
            id: targetCard.dataset.id,
            name: targetCard.dataset.name,
            type: targetCard.dataset.type,
            power: parseInt(targetCard.dataset.basePower),
            ability: targetCard.dataset.ability,
            isHero: targetCard.dataset.isHero === "true",
            partner: targetCard.dataset.partner,
            row: targetCard.dataset.row
        };

        const handContainer = document.querySelector('.hand-cards');
        if (handContainer) {
            const newHandCard = createCardElement(returnedCardObj);
            handContainer.appendChild(newHandCard);
        }

        // 2. Place Decoy in Target's Spot
        // We want to insert the decoy exactly where the target is.
        // Since draggingCard is currently in the hand (or source), we move it.
        
        // Remove target from DOM
        const parent = targetCard.parentNode;
        parent.insertBefore(draggingCard, targetCard);
        targetCard.remove();

        // 3. Finalize Decoy State
        draggingCard.draggable = false;
        draggingCard.classList.remove('dragging');
        
        // 4. Update Game State
        updateScore();

        // 5. Trigger Enemy Turn
        if (!enemyPassed) {
            isProcessingTurn = true;
            updateTurnVisuals();
            setTimeout(() => {
                enemyTurn();
                isProcessingTurn = false;
                updateTurnVisuals();
            }, 1500);
        }
    });

    return el;
}

// --- Card Drop Logic (for Decoy) ---

// Deprecated named functions (logic moved inline to createCardElement)
function cardDragOver(e) {}
function cardDragLeave(e) {}
function cardDrop(e) {}

// --- Ability Logic ---

function triggerAbility(cardElement, rowElement) {
    const ability = cardElement.dataset.ability;
    const name = cardElement.dataset.name;
    const basePower = parseInt(cardElement.dataset.basePower);

    switch (ability) {
        case 'tight_bond':
            applyTightBond(rowElement, name, basePower);
            break;
        case 'spy':
            applySpy(cardElement, rowElement);
            break;
        case 'spy_medic':
            applySpy(cardElement, rowElement);
            applyMedic(cardElement, rowElement);
            break;
        case 'scorch':
            applyScorch(cardElement, rowElement);
            break;
        case 'medic':
            applyMedic(cardElement, rowElement);
            break;
        case 'weather_frost':
            applyWeather('frost');
            break;
        case 'weather_fog':
            applyWeather('fog');
            break;
        case 'weather_rain':
            applyWeather('rain');
            break;
        case 'weather_clear':
            clearWeather();
            break;
        case 'decoy':
            // Decoy logic is now handled via manual drop on target card
            break;
        // Future abilities can be added here
        default:
            break;
    }
}

function applyWeather(type) {
    activeWeather[type] = true;
    console.log(`Clima ativado: ${type}`);
    updateWeatherVisuals();
    updateScore();
}

function clearWeather() {
    activeWeather = { frost: false, fog: false, rain: false };
    console.log("Clima limpo!");
    updateWeatherVisuals();
    updateScore();
}

function updateWeatherVisuals() {
    // Remove old classes
    document.querySelectorAll('.row').forEach(row => {
        row.classList.remove('weather-active-frost', 'weather-active-fog', 'weather-active-rain');
    });

    // Apply new classes
    if (activeWeather.frost) {
        document.querySelectorAll('.row.melee').forEach(row => row.classList.add('weather-active-frost'));
    }
    if (activeWeather.fog) {
        document.querySelectorAll('.row.ranged').forEach(row => row.classList.add('weather-active-fog'));
    }
    if (activeWeather.rain) {
        document.querySelectorAll('.row.siege').forEach(row => row.classList.add('weather-active-rain'));
    }
}

function applyMedic(cardElement, currentRow) {
    const isPlayerSide = currentRow.classList.contains('player');
    const graveyard = isPlayerSide ? playerGraveyard : enemyGraveyard;

    if (graveyard.length === 0) {
        console.log("Nenhuma carta no cemitério para reviver.");
        return;
    }

    // Find the last non-hero card to revive (LIFO)
    let cardIndex = -1;
    for (let i = graveyard.length - 1; i >= 0; i--) {
        if (!graveyard[i].isHero) {
            cardIndex = i;
            break;
        }
    }

    if (cardIndex === -1) {
        console.log("Nenhuma carta válida (não-herói) para reviver.");
        return;
    }

    const cardToRevive = graveyard.splice(cardIndex, 1)[0];
    
    console.log(`Médico ativado! Revivendo: ${cardToRevive.name}`);

    // Determine where to play the revived card
    // It goes to the row matching its type on the same side
    const sideClass = isPlayerSide ? 'player' : 'opponent';
    const targetRowSelector = `.row.${sideClass}[data-type="${cardToRevive.type}"] .cards-container`;
    const targetContainer = document.querySelector(targetRowSelector);

    if (targetContainer) {
        const newCardElement = createCardElement(cardToRevive);
        
        // If it's enemy side, ensure it's not draggable
        if (!isPlayerSide) {
            newCardElement.draggable = false;
        } else {
            // If player revived it, it should be locked in place (played), not draggable back to hand
            newCardElement.draggable = false; 
        }

        targetContainer.appendChild(newCardElement);
        
        // Trigger Ability of the revived card! (Chain Reaction)
        // Use setTimeout to allow DOM to update and visual effect to be distinct
        setTimeout(() => {
            triggerAbility(newCardElement, targetContainer.closest('.row'));
            updateScore();
        }, 300);
    }
}

function applyDecoy(cardElement, currentRow) {
    // Deprecated: Logic moved to manual drop on card
}

function applyTightBond(row, name, basePower) {
    // Deprecated: Logic moved to updateScore() to handle dynamic weather changes
    // Keeping function signature to avoid breaking calls, but it does nothing now.
}

function applySpy(cardElement, currentRow) {
    const cardType = cardElement.dataset.type;
    const isPlayerSide = currentRow.classList.contains('player');
    
    // Determine target side (Opposite of current)
    const targetSideClass = isPlayerSide ? 'opponent' : 'player';
    
    // Find the corresponding row on the other side
    // Selector looks for .row.{targetSide}.{cardType} .cards-container
    const targetRowSelector = `.row.${targetSideClass}[data-type="${cardType}"] .cards-container`;
    const targetContainer = document.querySelector(targetRowSelector);

    if (targetContainer) {
        // Move the card to the opponent's field
        targetContainer.appendChild(cardElement);
        
        // Visual feedback for Spy (maybe an eye icon or color change)
        cardElement.classList.add('spy-card');
        
        console.log(`Espião ativado! Carta movida para ${targetSideClass}.`);

        // Draw 1 card for the person who played the spy (Nerfed from 2)
        if (isPlayerSide) {
            drawCard('player', 1);
        } else {
            drawCard('opponent', 1);
        }
    }
}

function drawCard(who, count) {
    for (let i = 0; i < count; i++) {
        if (who === 'player') {
            const randomCard = allCardsData[Math.floor(Math.random() * allCardsData.length)];
            const newCard = { ...randomCard, id: `p_draw_${Date.now()}_${i}_${randomCard.id}` };
            const handContainer = document.querySelector('.hand-cards');
            if (handContainer) {
                handContainer.appendChild(createCardElement(newCard));
            }
        } else {
            // Add to enemy hand array
            const randomCard = allCardsData[Math.floor(Math.random() * allCardsData.length)];
            enemyHand.push({ ...randomCard, id: `e_draw_${Date.now()}_${i}_${randomCard.id}` });
            updateEnemyHandUI();
        }
    }
    console.log(`${who} comprou ${count} cartas.`);
}

function applyScorch(cardElement, currentRow) {
    const cardType = cardElement.dataset.type;
    const isPlayerSide = currentRow.classList.contains('player');
    const targetSideClass = isPlayerSide ? 'opponent' : 'player';
    
    // Target the corresponding enemy row
    const targetRowSelector = `.row.${targetSideClass}[data-type="${cardType}"] .cards-container`;
    const targetContainer = document.querySelector(targetRowSelector);
    
    if (!targetContainer) return;

    const enemyCards = Array.from(targetContainer.querySelectorAll('.card'));
    if (enemyCards.length === 0) return;

    // Filter out Heroes (Immune to Scorch)
    const vulnerableCards = enemyCards.filter(card => card.dataset.isHero !== "true");

    if (vulnerableCards.length === 0) {
        console.log("Scorch falhou: Apenas heróis na fileira.");
        return;
    }

    // Find Max Power among vulnerable cards
    let maxPower = -1;
    vulnerableCards.forEach(card => {
        const power = parseInt(card.dataset.power);
        if (power > maxPower) {
            maxPower = power;
        }
    });

    // Identify targets (only if maxPower > 0)
    const targets = vulnerableCards.filter(card => parseInt(card.dataset.power) === maxPower);

    if (targets.length > 0) {
        console.log(`Scorch ativado! Destruindo ${targets.length} cartas com força ${maxPower}.`);
        
        targets.forEach(card => {
            card.classList.add('burning'); // Use new animation class
            // Remove after animation (0.8s defined in CSS)
            setTimeout(() => {
                // Add to graveyard before removing
                const cardObj = {
                    id: card.dataset.id,
                    name: card.dataset.name,
                    type: card.dataset.type,
                    power: parseInt(card.dataset.basePower),
                    ability: card.dataset.ability,
                    isHero: card.dataset.isHero === "true"
                };
                
                if (card.closest('.opponent-side')) {
                    enemyGraveyard.push(cardObj);
                } else {
                    playerGraveyard.push(cardObj);
                }

                if (card.parentNode) {
                    card.parentNode.removeChild(card);
                }
                updateScore();
            }, 800); // Wait for animation
        });
    }
}

// --- Game Logic ---

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

        // 2. Check Tight Bonds
        // Count occurrences of each name
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
            // Only if the card HAS the tight_bond ability AND there are others
            // Heroes usually don't bond, but if they did, they might be immune to buffs too?
            // Classic Gwent: Heroes don't get buffed by Horns/Bonds.
            // Let's assume Heroes are immune to ALL modifications (positive or negative).
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
            const badge = card.querySelector('.card-power');
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
            
            // Update dataset for other logic (like Scorch) to use current power
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
// ===       IA TÁTICA - FUNÇÕES AUXILIARES  ===
// ============================================

/**
 * Conta quantas cartas o jogador tem na mão
 */
function getPlayerHandCount() {
    const handContainer = document.querySelector('.hand-cards');
    if (!handContainer) return 0;
    return handContainer.querySelectorAll('.card').length;
}

/**
 * Verifica se o parceiro de uma carta está no tabuleiro do inimigo
 */
function isPartnerOnBoard(partnerName) {
    const opponentRows = document.querySelectorAll('.row.opponent .cards-container');
    for (const container of opponentRows) {
        if (container.querySelector(`.card[data-name="${partnerName}"]`)) {
            return true;
        }
    }
    return false;
}

/**
 * Verifica se o parceiro de uma carta está na mão do inimigo
 */
function isPartnerInHand(partnerName) {
    return enemyHand.some(c => c.name === partnerName);
}

/**
 * Encontra espiões do jogador no lado do inimigo (para recolher com Decoy)
 */
function findPlayerSpiesOnEnemySide() {
    const spies = [];
    const opponentRows = document.querySelectorAll('.row.opponent .cards-container');
    opponentRows.forEach(container => {
        const cards = Array.from(container.querySelectorAll('.card'));
        cards.forEach(card => {
            // Espiões jogados pelo jogador vão para o lado do oponente
            // Identificamos pelo ID que começa com "p" (player) ou pela classe spy-card
            if (card.classList.contains('spy-card') && card.dataset.isHero !== "true") {
                spies.push(card);
            }
        });
    });
    return spies;
}

/**
 * Encontra alvos válidos para o Decoy no lado do inimigo
 */
function findDecoyTargets() {
    const targets = [];
    const opponentRows = document.querySelectorAll('.row.opponent .cards-container');
    opponentRows.forEach(container => {
        const cards = Array.from(container.querySelectorAll('.card'));
        cards.forEach(card => {
            if (card.dataset.isHero !== "true" && card.dataset.ability !== 'decoy') {
                targets.push({
                    element: card,
                    basePower: parseInt(card.dataset.basePower),
                    currentPower: parseInt(card.dataset.power),
                    ability: card.dataset.ability,
                    isSpy: card.classList.contains('spy-card')
                });
            }
        });
    });
    return targets;
}

/**
 * Encontra a carta mais forte no lado do JOGADOR (para avaliar Scorch)
 */
function findStrongestPlayerCard() {
    let maxPower = -1;
    let strongestCard = null;
    const playerRows = document.querySelectorAll('.row.player .cards-container');
    playerRows.forEach(container => {
        const cards = Array.from(container.querySelectorAll('.card'));
        cards.forEach(card => {
            if (card.dataset.isHero !== "true") {
                const power = parseInt(card.dataset.power);
                if (power > maxPower) {
                    maxPower = power;
                    strongestCard = card;
                }
            }
        });
    });
    return { card: strongestCard, power: maxPower };
}

/**
 * Encontra a carta mais forte no lado do INIMIGO (para evitar fogo amigo)
 */
function findStrongestEnemyCard() {
    let maxPower = -1;
    let strongestCard = null;
    const opponentRows = document.querySelectorAll('.row.opponent .cards-container');
    opponentRows.forEach(container => {
        const cards = Array.from(container.querySelectorAll('.card'));
        cards.forEach(card => {
            if (card.dataset.isHero !== "true") {
                const power = parseInt(card.dataset.power);
                if (power > maxPower) {
                    maxPower = power;
                    strongestCard = card;
                }
            }
        });
    });
    return { card: strongestCard, power: maxPower };
}

/**
 * Conta o total de cartas jogadas no tabuleiro (para determinar fase do jogo)
 */
function getTotalCardsOnBoard() {
    let count = 0;
    const allRows = document.querySelectorAll('.row .cards-container');
    allRows.forEach(container => {
        count += container.querySelectorAll('.card').length;
    });
    return count;
}

/**
 * Determina a melhor fileira para jogar cartas Agile (row: 'all')
 */
function getBestRowForAgile() {
    // Preferência: fileira com menos clima ativo ou mais cartas aliadas para sinergia
    const rowTypes = ['melee', 'ranged', 'siege'];
    const weatherMap = { melee: 'frost', ranged: 'fog', siege: 'rain' };
    
    // Priorizar fileira sem clima
    for (const type of rowTypes) {
        if (!activeWeather[weatherMap[type]]) {
            return type;
        }
    }
    return 'melee'; // Default
}

// ============================================
// ===        IA TÁTICA - FUNÇÃO PRINCIPAL   ===
// ============================================

function enemyTurn() {
    if (enemyPassed) return;

    const scores = updateScore();
    const playerHandCount = getPlayerHandCount();
    const totalCardsOnBoard = getTotalCardsOnBoard();
    const isEarlyGame = totalCardsOnBoard < 6;
    const scoreDifference = scores.totalOpponent - scores.totalPlayer;
    
    console.log(`[IA] Pontuação: Inimigo ${scores.totalOpponent} vs Jogador ${scores.totalPlayer}`);
    console.log(`[IA] Cartas na mão: Inimigo ${enemyHand.length} vs Jogador ${playerHandCount}`);

    // ==========================================
    // REGRA 1: VERIFICAR SE DEVE PASSAR
    // ==========================================
    
    // 1.1 - Mão vazia: forçar passar
    if (enemyHand.length === 0) {
        console.log("[IA] Sem cartas na mão. Passando.");
        passTurn('opponent');
        return;
    }

    // 1.2 - Jogador passou E inimigo está ganhando: PASSAR IMEDIATAMENTE
    if (playerPassed && scores.totalOpponent > scores.totalPlayer) {
        console.log("[IA] Jogador passou e estou ganhando. Passando para economizar cartas!");
        passTurn('opponent');
        return;
    }

    // 1.3 - Vantagem >= 15 pontos E menos cartas que o jogador: passar para economizar
    if (scoreDifference >= 15 && enemyHand.length < playerHandCount) {
        console.log("[IA] Grande vantagem de pontos e menos cartas. Passando estrategicamente!");
        passTurn('opponent');
        return;
    }

    // ==========================================
    // REGRA 2-6: AVALIAR PRIORIDADES DAS CARTAS
    // ==========================================
    
    let bestCardIndex = -1;
    let maxPriority = -1;
    let bestDecoyTarget = null;
    let bestRowOverride = null; // Para cartas Agile

    enemyHand.forEach((card, index) => {
        let priority = 0;
        let decoyTarget = null;
        let rowOverride = null;

        const ability = card.ability || 'none';

        // ------------------------------------------
        // REGRA 2: ESPIÕES (Alta prioridade no início ou se perdendo)
        // ------------------------------------------
        if (ability === 'spy' || ability === 'spy_medic') {
            if (isEarlyGame) {
                priority = 100; // Prioridade MÁXIMA no início (vantagem de cartas)
                console.log(`[IA] Espião ${card.name}: Prioridade 100 (início do jogo)`);
            } else if (scores.totalOpponent < scores.totalPlayer) {
                priority = 90; // Alta prioridade se estiver perdendo
                console.log(`[IA] Espião ${card.name}: Prioridade 90 (perdendo)`);
            } else if (enemyHand.length < playerHandCount) {
                priority = 80; // Alta se tiver menos cartas
                console.log(`[IA] Espião ${card.name}: Prioridade 80 (menos cartas)`);
            } else {
                priority = 30; // Prioridade moderada
                console.log(`[IA] Espião ${card.name}: Prioridade 30 (padrão)`);
            }
        }

        // ------------------------------------------
        // REGRA 3: MÉDICO
        // ------------------------------------------
        else if (ability === 'medic') {
            const validTargets = enemyGraveyard.filter(c => !c.isHero);
            
            if (validTargets.length === 0) {
                priority = 0; // ZERO se cemitério vazio
                console.log(`[IA] Médico ${card.name}: Prioridade 0 (cemitério vazio)`);
            } else {
                const maxGravePower = Math.max(...validTargets.map(c => c.power));
                if (maxGravePower >= 5) {
                    priority = 70 + maxGravePower; // Alta prioridade para unidades fortes
                    console.log(`[IA] Médico ${card.name}: Prioridade ${priority} (unidade forte no cemitério)`);
                } else {
                    priority = 20 + maxGravePower; // Prioridade baixa-moderada
                    console.log(`[IA] Médico ${card.name}: Prioridade ${priority} (unidade fraca no cemitério)`);
                }
            }
        }

        // ------------------------------------------
        // REGRA 4: PARCEIROS (Bond)
        // ------------------------------------------
        else if (ability === 'bond_partner' && card.partner) {
            const partnerOnBoard = isPartnerOnBoard(card.partner);
            const partnerInHand = isPartnerInHand(card.partner);

            if (partnerOnBoard) {
                priority = 150; // Prioridade MÁXIMA - completar o combo!
                console.log(`[IA] ${card.name}: Prioridade 150 (parceiro ${card.partner} na mesa!)`);
            } else if (partnerInHand) {
                priority = card.power + 15; // Boa prioridade - preparar combo
                console.log(`[IA] ${card.name}: Prioridade ${priority} (parceiro na mão, preparando combo)`);
            } else {
                priority = card.power; // Prioridade normal baseada em poder
                console.log(`[IA] ${card.name}: Prioridade ${priority} (sem parceiro disponível)`);
            }
        }

        // ------------------------------------------
        // REGRA 5: ESPANTALHO (Decoy)
        // ------------------------------------------
        else if (ability === 'decoy') {
            const targets = findDecoyTargets();
            
            if (targets.length === 0) {
                priority = 0; // NUNCA jogar sem alvo válido
                console.log(`[IA] Decoy: Prioridade 0 (sem alvos válidos)`);
            } else {
                // Prioridade 1: Recolher espiões do jogador (para jogar de volta!)
                const playerSpies = targets.filter(t => t.isSpy);
                if (playerSpies.length > 0) {
                    // Pegar o espião com maior poder base (para causar mais dano quando jogar de volta)
                    const bestSpy = playerSpies.reduce((a, b) => a.basePower > b.basePower ? a : b);
                    priority = 85; // Alta prioridade
                    decoyTarget = bestSpy.element;
                    console.log(`[IA] Decoy: Prioridade 85 (recolher espião do jogador: ${bestSpy.element.dataset.name})`);
                } 
                // Prioridade 2: Salvar carta forte (>= 6 poder base) afetada por clima
                else {
                    const strongWeakened = targets.filter(t => 
                        t.basePower >= 6 && t.currentPower < t.basePower && !t.isSpy
                    );
                    
                    if (strongWeakened.length > 0) {
                        const best = strongWeakened.reduce((a, b) => a.basePower > b.basePower ? a : b);
                        priority = 45 + best.basePower;
                        decoyTarget = best.element;
                        console.log(`[IA] Decoy: Prioridade ${priority} (salvar carta forte: ${best.element.dataset.name})`);
                    }
                    // Prioridade 3: Reutilizar Médico/Espião próprio
                    else {
                        const reusable = targets.filter(t => 
                            (t.ability === 'medic' || t.ability === 'spy' || t.ability === 'spy_medic') && !t.isSpy
                        );
                        
                        if (reusable.length > 0) {
                            const best = reusable[0];
                            priority = 40;
                            decoyTarget = best.element;
                            console.log(`[IA] Decoy: Prioridade 40 (reutilizar habilidade: ${best.element.dataset.name})`);
                        }
                        // Prioridade 4: Salvar qualquer carta forte
                        else {
                            const strong = targets.filter(t => t.basePower >= 6 && !t.isSpy);
                            if (strong.length > 0) {
                                const best = strong.reduce((a, b) => a.basePower > b.basePower ? a : b);
                                priority = 25;
                                decoyTarget = best.element;
                                console.log(`[IA] Decoy: Prioridade 25 (salvar carta: ${best.element.dataset.name})`);
                            } else {
                                priority = 0; // Não vale a pena
                                console.log(`[IA] Decoy: Prioridade 0 (nenhum alvo vale a pena)`);
                            }
                        }
                    }
                }
            }
        }

        // ------------------------------------------
        // REGRA 6: SCORCH (Queima)
        // ------------------------------------------
        else if (ability === 'scorch') {
            const strongestPlayer = findStrongestPlayerCard();
            const strongestEnemy = findStrongestEnemyCard();
            
            // Só jogar se a carta mais forte for do JOGADOR (evitar fogo amigo)
            if (strongestPlayer.power > 0 && strongestPlayer.power > strongestEnemy.power) {
                priority = 60 + strongestPlayer.power; // Quanto mais forte a carta, melhor
                console.log(`[IA] Scorch: Prioridade ${priority} (destruir carta de ${strongestPlayer.power} poder)`);
            } else if (strongestPlayer.power > 0 && strongestPlayer.power === strongestEnemy.power) {
                priority = 5; // Muito baixa - troca desvantajosa
                console.log(`[IA] Scorch: Prioridade 5 (empate de poder - evitando)`);
            } else {
                priority = 0; // Não jogar - fogo amigo
                console.log(`[IA] Scorch: Prioridade 0 (evitando fogo amigo)`);
            }
        }

        // ------------------------------------------
        // CARTAS CLIMÁTICAS
        // ------------------------------------------
        else if (card.type === 'weather') {
            // Avaliar se o clima beneficiaria mais o inimigo
            // Por agora, prioridade baixa
            priority = 10;
            console.log(`[IA] Clima ${card.name}: Prioridade 10`);
        }

        // ------------------------------------------
        // HERÓIS E UNIDADES PADRÃO
        // ------------------------------------------
        else {
            // Heróis: imunes a clima, alta prioridade se clima ativo
            if (card.isHero) {
                if (activeWeather.frost || activeWeather.fog || activeWeather.rain) {
                    priority = card.power + 20; // Bônus em clima
                    console.log(`[IA] Herói ${card.name}: Prioridade ${priority} (imune ao clima)`);
                } else {
                    priority = card.power + 10;
                    console.log(`[IA] Herói ${card.name}: Prioridade ${priority}`);
                }
            } else {
                // Unidades normais
                priority = card.power;
                
                // Penalizar se a fileira está com clima
                const rowType = card.row === 'all' ? getBestRowForAgile() : card.type;
                const weatherMap = { melee: 'frost', ranged: 'fog', siege: 'rain' };
                if (activeWeather[weatherMap[rowType]]) {
                    priority = Math.max(1, priority - 3); // Reduzir prioridade
                    console.log(`[IA] ${card.name}: Prioridade ${priority} (penalizado por clima)`);
                } else {
                    console.log(`[IA] ${card.name}: Prioridade ${priority}`);
                }
                
                // Guardar row override para cartas Agile
                if (card.row === 'all') {
                    rowOverride = rowType;
                }
            }
        }

        // Atualizar melhor carta
        if (priority > maxPriority) {
            maxPriority = priority;
            bestCardIndex = index;
            bestDecoyTarget = decoyTarget;
            bestRowOverride = rowOverride;
        }
    });

    // ==========================================
    // EXECUTAR A JOGADA
    // ==========================================

    // Fallback: se não encontrou boa jogada
    if (bestCardIndex === -1 || maxPriority <= 0) {
        // Se está ganhando, passar
        if (scores.totalOpponent > scores.totalPlayer) {
            console.log("[IA] Sem boas jogadas e ganhando. Passando.");
            passTurn('opponent');
            return;
        }
        // Senão, jogar a carta de menor valor (economizar as boas)
        let minPower = Infinity;
        enemyHand.forEach((card, index) => {
            if (card.ability !== 'decoy' && card.power < minPower) {
                minPower = card.power;
                bestCardIndex = index;
            }
        });
        // Se só tem Decoy sem alvo, forçar passar
        if (bestCardIndex === -1) {
            console.log("[IA] Apenas Decoy sem alvo. Passando.");
            passTurn('opponent');
            return;
        }
        console.log("[IA] Jogando carta de menor valor como fallback.");
    }

    const cardToPlay = enemyHand[bestCardIndex];
    console.log(`[IA] >>> Jogando: ${cardToPlay.name} (Prioridade: ${maxPriority})`);
    
    // Remover da mão
    enemyHand.splice(bestCardIndex, 1);
    updateEnemyHandUI();

    // ------------------------------------------
    // EXECUTAR DECOY
    // ------------------------------------------
    if (cardToPlay.ability === 'decoy' && bestDecoyTarget) {
        console.log(`[IA] Decoy ativado em: ${bestDecoyTarget.dataset.name}`);
        
        // 1. Devolver alvo para a mão do inimigo
        const returnedCardObj = {
            id: bestDecoyTarget.dataset.id,
            name: bestDecoyTarget.dataset.name,
            type: bestDecoyTarget.dataset.type,
            power: parseInt(bestDecoyTarget.dataset.basePower),
            ability: bestDecoyTarget.dataset.ability,
            isHero: bestDecoyTarget.dataset.isHero === "true",
            partner: bestDecoyTarget.dataset.partner,
            row: bestDecoyTarget.dataset.row
        };
        enemyHand.push(returnedCardObj);
        updateEnemyHandUI();

        // 2. Colocar Decoy no lugar
        const decoyElement = createCardElement(cardToPlay);
        decoyElement.draggable = false;
        
        const parent = bestDecoyTarget.parentNode;
        parent.insertBefore(decoyElement, bestDecoyTarget);
        bestDecoyTarget.remove();
        
        updateScore();
        return;
    }

    // ------------------------------------------
    // EXECUTAR JOGADA PADRÃO
    // ------------------------------------------
    let targetContainer = null;
    
    if (cardToPlay.type === 'weather') {
        // Clima não vai para o tabuleiro, apenas ativa o efeito
        const cardElement = createCardElement(cardToPlay);
        const dummyRow = document.querySelector('.row.opponent');
        triggerAbility(cardElement, dummyRow);
        enemyGraveyard.push(cardToPlay);
        console.log(`[IA] Clima ativado: ${cardToPlay.name}`);
    } else {
        // Determinar fileira alvo
        let rowType = cardToPlay.type;
        if (cardToPlay.row === 'all') {
            rowType = bestRowOverride || getBestRowForAgile();
        }
        
        targetContainer = document.querySelector(`.row.opponent[data-type="${rowType}"] .cards-container`);
        
        if (targetContainer) {
            const cardElement = createCardElement(cardToPlay);
            cardElement.draggable = false;
            targetContainer.appendChild(cardElement);
            
            // Ativar habilidade
            const row = targetContainer.closest('.row');
            triggerAbility(cardElement, row);
            
            console.log(`[IA] Carta jogada: ${cardToPlay.name} na fileira ${rowType}`);
        }
    }

    updateScore();
}

function passTurn(who) {
    if (who === 'opponent') {
        enemyPassed = true;
        document.querySelector('.opponent-side').classList.add('passed');
        updateTurnVisuals();
        checkEndRound();
    }
}

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

function enemyTurnLoop() {
    if (enemyPassed) return;

    isProcessingTurn = true;
    updateTurnVisuals();

    setTimeout(() => {
        enemyTurn();
        if (!enemyPassed && playerPassed) {
            enemyTurnLoop(); // Continue playing if player passed
        } else {
            isProcessingTurn = false;
            updateTurnVisuals();
        }
    }, 1500);
}

function checkEndRound() {
    if (playerPassed && enemyPassed) {
        const scores = updateScore();
        setTimeout(() => {
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
        // Draw: Both get a win point (Gwent classic rule variant or just replay)
        // For simplicity here: Both get a point
        playerWins++;
        enemyWins++;
        message = "Empate! Ambos pontuam.";
        updateGems("player", playerWins);
        updateGems("opponent", enemyWins);
    }

    alert(`${message}\nPlacar da Partida: Jogador ${playerWins} - ${enemyWins} Oponente`);

    if (playerWins >= 2 || enemyWins >= 2) {
        if (playerWins >= 2 && enemyWins >= 2) {
             alert("A Partida terminou em EMPATE GERAL!");
        } else if (playerWins >= 2) {
            alert("PARABÉNS! VOCÊ VENCEU A PARTIDA!");
        } else {
            alert("GAME OVER! O Oponente venceu a partida.");
        }
        location.reload(); // Reset Game
    } else {
        prepareNextRound();
    }
}

function updateGems(who, count) {
    const containerId = who === "player" ? "player-gems" : "opponent-gems";
    const container = document.getElementById(containerId);
    const gems = container.querySelectorAll('.gem');
    
    for (let i = 0; i < count; i++) {
        if (gems[i]) gems[i].classList.add('active');
    }
}

function prepareNextRound() {
    // 1. Clear Board (Visual & Logic)
    const allRows = document.querySelectorAll('.row .cards-container');
    allRows.forEach(container => {
        const cards = container.querySelectorAll('.card');
        cards.forEach(card => {
            // Reconstruct card object from dataset
            const cardObj = {
                id: card.dataset.id,
                name: card.dataset.name,
                type: card.dataset.type,
                power: parseInt(card.dataset.basePower),
                ability: card.dataset.ability,
                isHero: card.dataset.isHero === "true"
            };

            // Determine owner based on row class (simplified logic)
            // In a real game, we'd track owner more explicitly, but here row tells us side
            // Note: Spies are on opponent side but belong to the player who played them? 
            // For simplicity, if it's on opponent side, it goes to opponent graveyard.
            // Gwent rules: Spies go to the graveyard of the player on whose side they are.
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

// --- Drag and Drop Logic ---

function dragStart(e) {
    if (playerPassed || isProcessingTurn) {
        e.preventDefault();
        return;
    }

    // Decoy Validation: Check if there are valid targets
    if (e.target.dataset.ability === 'decoy') {
        const playerRows = document.querySelectorAll('.row.player .cards-container');
        let hasTarget = false;
        
        playerRows.forEach(container => {
            const cards = Array.from(container.querySelectorAll('.card'));
            cards.forEach(c => {
                if (c.dataset.isHero !== "true" && c.dataset.ability !== "decoy") {
                    hasTarget = true;
                }
            });
        });

        if (!hasTarget) {
            e.preventDefault();
            alert("Não há unidades para recolher!");
            return;
        }
    }

    // Store card ID and Type in dataTransfer
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.dataTransfer.setData('card-type', e.target.dataset.type);
    
    // Visual feedback
    e.target.classList.add('dragging');
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function setupDragAndDrop() {
    // Select only Player rows for drop targets
    const playerRows = document.querySelectorAll('.row.player');

    playerRows.forEach(row => {
        row.addEventListener('dragover', dragOver);
        row.addEventListener('dragleave', dragLeave);
        row.addEventListener('drop', drop);
    });
}

function dragOver(e) {
    e.preventDefault(); // Necessary to allow dropping
    if (playerPassed) return;
    const row = e.currentTarget;
    row.classList.add('drag-over');
}

function dragLeave(e) {
    const row = e.currentTarget;
    row.classList.remove('drag-over');
}

function drop(e) {
    e.preventDefault();
    const row = e.currentTarget;
    row.classList.remove('drag-over');

    if (playerPassed || isProcessingTurn) return;

    // Retrieve data
    const cardId = e.dataTransfer.getData('text/plain');
    const cardType = e.dataTransfer.getData('card-type');
    const rowType = row.dataset.type;

    const card = document.querySelector(`.card[data-id="${cardId}"]`);
    if (!card) return;

    const cardRow = card.dataset.row;

    // Validation: Card Type must match Row Type OR Card is Weather OR Card Row is 'all'
    if (cardType === 'weather' || cardType === rowType || cardRow === 'all') {
        if (card) {
            // Decoy Check: Cannot be dropped on row (must target a card)
            if (card.dataset.ability === 'decoy') {
                console.log("Espantalho jogado no vazio. Ação cancelada.");
                return;
            }

            if (cardType === 'weather') {
                // Trigger Ability
                triggerAbility(card, row);
                
                // Move to graveyard immediately (visual discard)
                const cardObj = {
                    id: card.dataset.id,
                    name: card.dataset.name,
                    type: card.dataset.type,
                    power: parseInt(card.dataset.basePower),
                    ability: card.dataset.ability,
                    isHero: card.dataset.isHero === "true"
                };
                playerGraveyard.push(cardObj);
                
                card.remove(); // Remove from hand/drag source
                
                // Update Score (Weather effect applied)
                updateScore();

                // Trigger Enemy Turn
                if (!enemyPassed) {
                    isProcessingTurn = true;
                    updateTurnVisuals();
                    setTimeout(() => {
                        enemyTurn();
                        isProcessingTurn = false;
                        updateTurnVisuals();
                    }, 1500);
                }
            } else {
                // Move card to the row's card container
                const cardsContainer = row.querySelector('.cards-container');
                cardsContainer.appendChild(card);
                
                // Disable drag for played card
                card.draggable = false;
                card.classList.remove('dragging');

                // Trigger Ability
                triggerAbility(card, row);

                // Update Score
                updateScore();

                // Handle Special Cards (Spells) - Remove after use
                if (card.dataset.kind === 'special') {
                    setTimeout(() => {
                        // Move to graveyard
                        const cardObj = {
                            id: card.dataset.id,
                            name: card.dataset.name,
                            type: card.dataset.type,
                            kind: card.dataset.kind,
                            power: parseInt(card.dataset.basePower),
                            ability: card.dataset.ability,
                            isHero: card.dataset.isHero === "true"
                        };
                        playerGraveyard.push(cardObj);
                        
                        // Remove from board
                        card.remove();
                        updateScore(); // Update again after removal
                    }, 1000); // Wait for animation/effect
                }

                // Trigger Enemy Turn
                if (!enemyPassed) {
                    isProcessingTurn = true;
                    updateTurnVisuals();
                    setTimeout(() => {
                        enemyTurn();
                        isProcessingTurn = false;
                        updateTurnVisuals();
                    }, 1500);
                }
            }
        }
    } else {
        console.log(`Jogada Inválida: Carta ${cardType} não pode ir na fileira ${rowType}.`);
    }
}
